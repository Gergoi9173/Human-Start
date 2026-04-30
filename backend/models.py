from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Resource(Base):
    __tablename__ = "resources"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    
    allocations = relationship("Allocation", back_populates="resource")

class Project(Base):
    __tablename__ = "projects"
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, index=True)

class Requester(Base):
    __tablename__ = "requesters"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)

class AllocationFrame(Base):
    __tablename__ = "allocation_frames"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)

class Allocation(Base):
    __tablename__ = "allocations"
    id = Column(Integer, primary_key=True, index=True)
    resource_id = Column(Integer, ForeignKey("resources.id"))
    project_id = Column(Integer, ForeignKey("projects.id"))
    requester_id = Column(Integer, ForeignKey("requesters.id"))
    frame_id = Column(Integer, ForeignKey("allocation_frames.id"))
    date = Column(String, index=True)
    percentage = Column(Integer)

    resource = relationship("Resource", back_populates="allocations")
    project = relationship("Project")
    requester = relationship("Requester")
    frame = relationship("AllocationFrame")
