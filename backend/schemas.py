from pydantic import BaseModel
from typing import List, Optional

class ResourceBase(BaseModel):
    name: str

class Resource(ResourceBase):
    id: int
    class Config:
        from_attributes = True

class ProjectBase(BaseModel):
    code: str

class Project(ProjectBase):
    id: int
    class Config:
        from_attributes = True

class RequesterBase(BaseModel):
    name: str

class Requester(RequesterBase):
    id: int
    class Config:
        from_attributes = True

class AllocationFrameBase(BaseModel):
    name: str

class AllocationFrame(AllocationFrameBase):
    id: int
    class Config:
        from_attributes = True

class AllocationBase(BaseModel):
    resource_id: int
    project_id: int
    requester_id: int
    frame_id: int
    date: str
    percentage: int

class AllocationCreate(AllocationBase):
    pass

class AllocationUpdate(BaseModel):
    percentage: int

class Allocation(AllocationBase):
    id: int
    project: Project
    requester: Requester
    frame: AllocationFrame

    class Config:
        from_attributes = True
