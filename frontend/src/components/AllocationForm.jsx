import { useState } from 'react';
import Select from 'react-select';
import { X } from 'lucide-react';

export default function AllocationForm({ 
  resource: initialResource, 
  resources,
  date, 
  projects, 
  requesters, 
  frames, 
  onSave, 
  onClose 
}) {
  const [resourceId, setResourceId] = useState(initialResource ? { value: initialResource.id, label: `${initialResource.name} (${initialResource.position})` } : null);
  const [projectId, setProjectId] = useState(null);
  const [requesterId, setRequesterId] = useState('');
  const [frameId, setFrameId] = useState('');
  const [percentage, setPercentage] = useState(20);

  const resourceOptions = resources ? resources.map(r => ({ value: r.id, label: `${r.name} (${r.position})` })) : [];
  const projectOptions = projects.map(p => ({ value: p.id, label: p.code }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!resourceId || !projectId || !requesterId || !frameId) return;

    onSave({
      resource_id: resourceId.value,
      project_id: projectId.value,
      requester_id: parseInt(requesterId),
      frame_id: parseInt(frameId),
      date,
      percentage: parseInt(percentage)
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-card rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold">
            {initialResource ? `Allocate: ${initialResource.name} (${initialResource.position})` : 'New Allocation'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {!initialResource && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Resource</label>
              <Select 
                options={resourceOptions}
                value={resourceId}
                onChange={setResourceId}
                className="text-black"
                placeholder="Search resource..."
                isClearable
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Project</label>
            <Select 
              options={projectOptions}
              value={projectId}
              onChange={setProjectId}
              className="text-black"
              placeholder="Search project..."
              isClearable
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Requester</label>
            <select 
              value={requesterId}
              onChange={e => setRequesterId(e.target.value)}
              className="w-full flex h-10 rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:text-foreground"
              required
            >
              <option value="" disabled className="text-black">Select requester...</option>
              {requesters.map(r => (
                <option key={r.id} value={r.id} className="text-black">{r.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Frame (Keret)</label>
            <select 
              value={frameId}
              onChange={e => setFrameId(e.target.value)}
              className="w-full flex h-10 rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:text-foreground"
              required
            >
              <option value="" disabled className="text-black">Select frame...</option>
              {frames.map(f => (
                <option key={f.id} value={f.id} className="text-black">{f.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Percentage (%)</label>
            <input 
              type="number" 
              min="1" 
              max="100" 
              value={percentage}
              onChange={e => setPercentage(e.target.value)}
              className="w-full flex h-10 rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:text-foreground font-bold text-lg"
              required
            />
            <p className="text-xs text-muted-foreground italic">Enter a value between 1 and 100.</p>
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 border border-input rounded-md hover:bg-muted transition-colors text-sm font-medium"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors shadow-sm text-sm font-medium"
            >
              Save Allocation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
