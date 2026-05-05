import React, { Fragment, useState, useEffect } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

const InlineEditPercentage = ({ initialValue, onSave }) => {
  const [value, setValue] = useState(initialValue);
  
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleBlur = () => {
    if (Number(value) !== initialValue) {
      onSave(Number(value));
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.target.blur();
    }
  };

  return (
    <input 
       type="number"
       value={value}
       onChange={(e) => setValue(e.target.value)}
       onBlur={handleBlur}
       onKeyDown={handleKeyDown}
       className="w-20 h-10 text-sm font-bold rounded-lg border-2 border-slate-300 bg-white px-2 py-1 text-right focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none text-slate-900 shadow-sm"
       min="0" max="100" step="5"
    />
  );
};

export default function ProjectTable({ projects, resources, allocations, onAddAllocation, onDeleteAllocation, onUpdateAllocation }) {
  const [expanded, setExpanded] = useState({});

  const toggleExpand = (projectId) => {
    setExpanded(prev => ({ ...prev, [projectId]: !prev[projectId] }));
  };

  const getAllocationsForProject = (projectId) => {
    return allocations.filter(a => a.project_id === projectId);
  };

  const getTotalPercentage = (projAllocations) => {
    return projAllocations.reduce((sum, a) => sum + a.percentage, 0);
  };

  const getResource = (resourceId) => {
    return resources.find(r => r.id === resourceId);
  };

  return (
    <div className="bg-white dark:bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
            <tr>
              <th scope="col" className="px-6 py-4 font-medium w-1/3">Project</th>
              <th scope="col" className="px-6 py-4 font-medium">Allocations</th>
              <th scope="col" className="px-6 py-4 font-medium w-32 text-center">Total %</th>
              <th scope="col" className="px-6 py-4 font-medium w-32 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {projects.map((project) => {
              const projAllocations = getAllocationsForProject(project.id);
              const total = getTotalPercentage(projAllocations);
              const isExpanded = expanded[project.id];

              return (
                <Fragment key={project.id}>
                  <tr className={`hover:bg-muted/30 transition-colors cursor-pointer ${isExpanded ? 'bg-muted/10' : ''}`} onClick={() => toggleExpand(project.id)}>
                    <td className="px-6 py-4 text-foreground">
                      <span className="font-bold">{project.code}</span>
                      {project.name && <span className="font-normal ml-1">({project.name})</span>}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground text-xs">
                      {projAllocations.length} resource{projAllocations.length !== 1 ? 's' : ''}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className={`inline-flex px-3 py-1.5 rounded-full font-bold text-xs shadow-sm transition-all
                        ${total > 0 ? 'bg-blue-600 text-white ring-4 ring-blue-500/10' : 'bg-muted text-muted-foreground'}
                      `}>
                        {total}%
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); onAddAllocation(null); }}
                          className="inline-flex items-center justify-center p-2 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground rounded-lg transition-colors shadow-sm"
                          title="Add Allocation"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                  
                  {isExpanded && (
                    <tr className="bg-white border-b border-slate-200">
                      <td colSpan="4" className="px-6 py-6">
                        <div className="flex flex-col gap-3 pl-6 border-l-4 border-slate-800">
                          {projAllocations.length === 0 && (
                            <span className="text-muted-foreground text-xs italic">No allocations yet.</span>
                          )}
                          {projAllocations.map(alloc => (
                            <div 
                              key={alloc.id} 
                              className="flex items-center gap-4 bg-white p-4 rounded-xl border-2 border-slate-200 shadow-sm hover:border-slate-400 transition-all max-w-2xl group"
                            >
                              <div className="flex-1 flex items-center justify-between">
                                <div className="flex flex-col">
                                  <span className="font-bold text-sm text-slate-900">
                                    {getResource(alloc.resource_id)?.name}
                                    <span className="text-muted-foreground text-xs ml-2 font-normal">({getResource(alloc.resource_id)?.position})</span>
                                  </span>
                                  <span className="text-slate-500 text-[10px] uppercase tracking-wider font-bold">{alloc.requester?.name} • {alloc.frame?.name}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <InlineEditPercentage 
                                    initialValue={alloc.percentage} 
                                    onSave={(val) => onUpdateAllocation(alloc.id, val)}
                                  />
                                  <span className="font-bold text-slate-900 text-sm">%</span>
                                </div>
                              </div>
                              <div className="pl-4 border-l border-border">
                                <button 
                                  onClick={() => onDeleteAllocation(alloc.id)}
                                  className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                                  title="Remove Allocation"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
