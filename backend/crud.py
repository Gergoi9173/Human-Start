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

def import_csv_data(db: Session, csv_lines):
    import csv
    
    reader = csv.reader(csv_lines, delimiter=';')
    try:
        header = next(reader)
    except StopIteration:
        return
        
    dates = [d.strip() for d in header[4:] if d.strip()]
    
    # Pre-load master data maps
    frame_map = {f.name: f.id for f in db.query(models.AllocationFrame).all()}
    req_map = {r.name: r.id for r in db.query(models.Requester).all()}
    proj_map = {p.code: p.id for p in db.query(models.Project).all()}
    res_map = {r.name: r.id for r in db.query(models.Resource).all()}
    
    def get_id(model, name_attr, name_val, cache, db_session):
        if name_val in cache:
            return cache[name_val]
        # Check DB again in case another worker just inserted it
        existing = db_session.query(model).filter(getattr(model, name_attr) == name_val).first()
        if existing:
            cache[name_val] = existing.id
            return existing.id
        # Try to insert
        try:
            new_obj = model(**{name_attr: name_val})
            db_session.add(new_obj)
            db_session.commit()
            db_session.refresh(new_obj)
            cache[name_val] = new_obj.id
            return new_obj.id
        except Exception: # Likely IntegrityError from concurrent insert
            db_session.rollback()
            existing = db_session.query(model).filter(getattr(model, name_attr) == name_val).first()
            if existing:
                cache[name_val] = existing.id
                return existing.id
        return None

    # Pre-load existing allocations for the involved dates to handle upserts
    existing_allocs = {}
    for date in dates:
        allocs = db.query(models.Allocation).filter(models.Allocation.date == date).all()
        for a in allocs:
            existing_allocs[(a.resource_id, a.project_id, a.requester_id, a.frame_id, a.date)] = a

    # Process rows one by one
    for row in reader:
        if len(row) < 4:
            continue
        req_name, frame_name, proj_code, res_name = [row[i].strip() for i in range(4)]
        if not all([req_name, frame_name, proj_code, res_name]):
            continue
            
        # Ensure master data exists and get IDs using the robust helper
        req_id = get_id(models.Requester, 'name', req_name, req_map, db)
        frame_id = get_id(models.AllocationFrame, 'name', frame_name, frame_map, db)
        proj_id = get_id(models.Project, 'code', proj_code, proj_map, db)
        res_id = get_id(models.Resource, 'name', res_name, res_map, db)

        if not all([req_id, frame_id, proj_id, res_id]):
            continue

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
                    # Add to local map to prevent double-adding if CSV has duplicates
                    existing_allocs[key] = new_alloc
            except ValueError:
                continue
        
        # Periodic commit to keep memory low and database consistent
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
        import_csv_data(db, f)
