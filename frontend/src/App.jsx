import { useState, useEffect, useCallback } from 'react';
import { Download, Plus } from 'lucide-react';
import { startOfWeek, format } from 'date-fns';

import WeekPicker from './components/WeekPicker';
import Dashboard from './components/Dashboard';
import AllocationTable from './components/AllocationTable';
import AllocationForm from './components/AllocationForm';

import * as api from './api';

function App() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const [resources, setResources] = useState([]);
  const [projects, setProjects] = useState([]);
  const [requesters, setRequesters] = useState([]);
  const [frames, setFrames] = useState([]);
  
  const [allocations, setAllocations] = useState([]);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);

  const startOfCurrentWeek = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const dateString = format(startOfCurrentWeek, 'yyyy.MM.dd');

  useEffect(() => {
    // Load Master Data
    Promise.all([
      api.getResources(),
      api.getProjects(),
      api.getRequesters(),
      api.getFrames()
    ]).then(([resData, projData, reqData, frameData]) => {
      setResources(resData);
      setProjects(projData);
      setRequesters(reqData);
      setFrames(frameData);
    });
  }, []);

  const loadAllocations = useCallback(() => {
    api.getAllocations(dateString).then(setAllocations);
  }, [dateString]);

  useEffect(() => {
    loadAllocations();
  }, [loadAllocations]);

  const handleAddAllocation = (resource) => {
    setSelectedResource(resource);
    setIsFormOpen(true);
  };

  const handleSaveAllocation = (allocationData) => {
    api.createAllocation(allocationData).then(() => {
      loadAllocations();
      setIsFormOpen(false);
      setSelectedResource(null);
    });
  };

  const handleDeleteAllocation = (id) => {
    api.deleteAllocation(id).then(() => {
      loadAllocations();
    });
  };

  const handleUpdateAllocation = (id, percentage) => {
    api.updateAllocation(id, percentage).then(() => {
      loadAllocations();
    });
  };



  return (
    <div className="min-h-screen bg-muted/20 text-foreground p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Human-Start</h1>
            <p className="text-muted-foreground mt-1 text-sm">Manage team allocations effortlessly.</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <WeekPicker 
              selectedDate={selectedDate} 
              setSelectedDate={setSelectedDate} 
              dateString={dateString} 
            />
            
            <button 
              onClick={() => { setSelectedResource(null); setIsFormOpen(true); }}
              className="inline-flex items-center space-x-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl shadow-md shadow-primary/20 hover:bg-primary/90 transition-all font-medium text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Erőforrás foglalás</span>
            </button>



            <a 
              href={api.exportCsvUrl(dateString)}
              className="inline-flex items-center space-x-2 bg-white dark:bg-card border border-border px-4 py-2.5 rounded-xl shadow-sm hover:bg-muted transition-colors font-medium text-sm"
              download
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </a>
          </div>
        </div>

        {/* Dashboard */}
        <Dashboard resources={resources} allocations={allocations} />

        {/* Main Table */}
        <AllocationTable 
          resources={resources} 
          allocations={allocations} 
          onAddAllocation={handleAddAllocation}
          onDeleteAllocation={handleDeleteAllocation}
          onUpdateAllocation={handleUpdateAllocation}
        />

        {/* Modal Form */}
        {isFormOpen && (
          <AllocationForm 
            resource={selectedResource}
            resources={resources}
            date={dateString}
            projects={projects}
            requesters={requesters}
            frames={frames}
            onSave={handleSaveAllocation}
            onClose={() => {
              setIsFormOpen(false);
              setSelectedResource(null);
            }}
          />
        )}
        
      </div>
    </div>
  );
}

export default App;
