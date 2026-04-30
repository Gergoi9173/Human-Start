from sqlalchemy.orm import Session
import models, schemas

def get_resources(db: Session):
    return db.query(models.Resource).all()

def get_projects(db: Session):
    return db.query(models.Project).all()

def get_requesters(db: Session):
    return db.query(models.Requester).all()

def get_frames(db: Session):
    return db.query(models.AllocationFrame).all()

def get_allocations_for_date(db: Session, date: str):
    return db.query(models.Allocation).filter(
        models.Allocation.date == date
    ).all()

def create_allocation(db: Session, allocation: schemas.AllocationCreate):
    db_allocation = models.Allocation(**allocation.model_dump())
    db.add(db_allocation)
    db.commit()
    db.refresh(db_allocation)
    return db_allocation

def update_allocation(db: Session, allocation_id: int, percentage: int):
    db_alloc = db.query(models.Allocation).filter(models.Allocation.id == allocation_id).first()
    if db_alloc:
        db_alloc.percentage = percentage
        db.commit()
        db.refresh(db_alloc)
    return db_alloc

def delete_allocation(db: Session, allocation_id: int):
    db_allocation = db.query(models.Allocation).filter(models.Allocation.id == allocation_id).first()
    if db_allocation:
        db.delete(db_allocation)
        db.commit()
    return db_allocation

def import_csv_data(db: Session, csv_content: str):
    import csv
    import io
    
    f = io.StringIO(csv_content)
    reader = csv.reader(f, delimiter=';')
    try:
        header = next(reader)
    except StopIteration:
        return
        
    dates = [d.strip() for d in header[4:] if d.strip()]
    
    # Pre-load master data to avoid redundant inserts and for mapping
    existing_frames = {f.name: f.id for f in db.query(models.AllocationFrame).all()}
    existing_requesters = {r.name: r.id for r in db.query(models.Requester).all()}
    existing_projects = {p.code: p.id for p in db.query(models.Project).all()}
    existing_resources = {r.name: r.id for r in db.query(models.Resource).all()}
    
    new_frames = set()
    new_requesters = set()
    new_projects = set()
    new_resources = set()
    
    csv_rows = []
    for row in reader:
        if len(row) < 4:
            continue
        req_name, frame_name, proj_code, res_name = [row[i].strip() for i in range(4)]
        if not all([req_name, frame_name, proj_code, res_name]):
            continue
            
        csv_rows.append(row)
        if req_name not in existing_requesters: new_requesters.add(req_name)
        if frame_name not in existing_frames: new_frames.add(frame_name)
        if proj_code not in existing_projects: new_projects.add(proj_code)
        if res_name not in existing_resources: new_resources.add(res_name)

    # Insert new master data
    for name in new_frames:
        obj = models.AllocationFrame(name=name)
        db.add(obj)
    for name in new_requesters:
        obj = models.Requester(name=name)
        db.add(obj)
    for name in new_projects:
        obj = models.Project(code=name)
        db.add(obj)
    for name in new_resources:
        obj = models.Resource(name=name)
        db.add(obj)
    db.commit()

    # Re-map IDs after inserts
    frame_map = {f.name: f.id for f in db.query(models.AllocationFrame).all()}
    req_map = {r.name: r.id for r in db.query(models.Requester).all()}
    proj_map = {p.code: p.id for p in db.query(models.Project).all()}
    res_map = {r.name: r.id for r in db.query(models.Resource).all()}

    # Batch process allocations
    # To handle upserts efficiently, we fetch existing allocations for the involved dates
    existing_allocs = {} # key: (res_id, proj_id, req_id, frame_id, date)
    for date in dates:
        allocs = db.query(models.Allocation).filter(models.Allocation.date == date).all()
        for a in allocs:
            existing_allocs[(a.resource_id, a.project_id, a.requester_id, a.frame_id, a.date)] = a

    for row in csv_rows:
        req_id = req_map[row[0].strip()]
        frame_id = frame_map[row[1].strip()]
        proj_id = proj_map[row[2].strip()]
        res_id = res_map[row[3].strip()]
        
        for i, val in enumerate(row[4:]):
            if i >= len(dates): break
            date = dates[i]
            val = val.replace('%', '').strip()
            if not val or val == '0': continue
            
            try:
                percentage = int(val)
                key = (res_id, proj_id, req_id, frame_id, date)
                if key in existing_allocs:
                    existing_allocs[key].percentage = percentage
                else:
                    new_alloc = models.Allocation(
                        resource_id=res_id,
                        project_id=proj_id,
                        requester_id=req_id,
                        frame_id=frame_id,
                        date=date,
                        percentage=percentage
                    )
                    db.add(new_alloc)
            except ValueError:
                continue
    
    db.commit()

def seed_data(db: Session):
    # Check if we already have allocations (only seed if empty)
    if db.query(models.AllocationFrame).first():
        return

    import os
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    csv_path = os.path.join(base_dir, "eroforras_kontrolling_2026.04.27_jóváhagyott másolata.csv")
    if not os.path.exists(csv_path):
        return

    with open(csv_path, 'r', encoding='windows-1250') as f:
        content = f.read()
        import_csv_data(db, content)
