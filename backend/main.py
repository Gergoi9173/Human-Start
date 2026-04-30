from fastapi import FastAPI, Depends, HTTPException, Response, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import csv
import io
import models, schemas, crud
from database import SessionLocal, engine, Base

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Resource Planner API")

# CORS setup for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Since it's a local tool
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.on_event("startup")
def on_startup():
    db = SessionLocal()
    crud.seed_data(db)
    db.close()

@app.get("/api/resources", response_model=List[schemas.Resource])
def read_resources(db: Session = Depends(get_db)):
    return crud.get_resources(db)

@app.get("/api/projects", response_model=List[schemas.Project])
def read_projects(db: Session = Depends(get_db)):
    return crud.get_projects(db)

@app.get("/api/requesters", response_model=List[schemas.Requester])
def read_requesters(db: Session = Depends(get_db)):
    return crud.get_requesters(db)

@app.get("/api/frames", response_model=List[schemas.AllocationFrame])
def read_frames(db: Session = Depends(get_db)):
    return crud.get_frames(db)

@app.get("/api/allocations/{date}", response_model=List[schemas.Allocation])
def read_allocations(date: str, db: Session = Depends(get_db)):
    return crud.get_allocations_for_date(db, date)

@app.post("/api/allocations", response_model=schemas.Allocation)
def create_allocation(allocation: schemas.AllocationCreate, db: Session = Depends(get_db)):
    # Simple validation for percentage limit is handled in frontend,
    # but we could enforce maximum total here if needed.
    return crud.create_allocation(db, allocation)

@app.patch("/api/allocations/{allocation_id}", response_model=schemas.Allocation)
def update_allocation(allocation_id: int, update_data: schemas.AllocationUpdate, db: Session = Depends(get_db)):
    updated = crud.update_allocation(db, allocation_id, update_data.percentage)
    if not updated:
        raise HTTPException(status_code=404, detail="Allocation not found")
    return updated

@app.delete("/api/allocations/{allocation_id}")
def delete_allocation(allocation_id: int, db: Session = Depends(get_db)):
    deleted = crud.delete_allocation(db, allocation_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Allocation not found")
    return {"ok": True}

@app.post("/api/import")
async def import_data(file: UploadFile = File(...), db: Session = Depends(get_db)):
    content = await file.read()
    try:
        decoded = content.decode('windows-1250')
    except UnicodeDecodeError:
        decoded = content.decode('utf-8')
    
    import io
    f = io.StringIO(decoded)
    crud.import_csv_data(db, f)
    return {"status": "success"}

@app.get("/api/export/csv")
def export_csv(date: str = None, db: Session = Depends(get_db)):
    if date:
        allocations = crud.get_allocations_for_date(db, date)
    else:
        allocations = db.query(models.Allocation).all()
        
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Date", "Resource", "Project", "Requester", "Frame", "Percentage"])
    
    for alloc in allocations:
        writer.writerow([
            alloc.date,
            alloc.resource.name,
            alloc.project.code,
            alloc.requester.name,
            alloc.frame.name,
            alloc.percentage
        ])
    
    output.seek(0)
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=allocations.csv"}
    )
