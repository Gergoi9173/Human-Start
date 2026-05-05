import { Users, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function Dashboard({ resources, allocations }) {
  const resourceTotals = {};
  resources.forEach(r => resourceTotals[r.id] = 0);
  
  allocations.forEach(a => {
    if (resourceTotals[a.resource_id] !== undefined) {
      resourceTotals[a.resource_id] += a.percentage;
    }
  });

  const totalDays = resources.length * 5;
  const utilizedDays = (Object.values(resourceTotals).reduce((sum, val) => sum + val, 0) / 100) * 5;
  const utilizationPercent = totalDays > 0 ? Math.round((utilizedDays / totalDays) * 100) : 0;
  
  const overAllocated = Object.entries(resourceTotals).filter(([_, total]) => total > 100).length;
  const fullyAllocated = Object.entries(resourceTotals).filter(([_, total]) => total === 100).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-white dark:bg-card p-6 rounded-2xl shadow-sm border border-border flex items-center space-x-4">
        <div className="p-3 bg-primary/10 rounded-xl">
          <Users className="w-8 h-8 text-primary" />
        </div>
        <div>
          <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Total Utilization</div>
          <div className="text-4xl font-black text-primary drop-shadow-sm">{utilizationPercent}%</div>
          <div className="text-xs text-muted-foreground mt-1">{utilizedDays} / {totalDays} nap</div>
        </div>
      </div>

      <div className="bg-white dark:bg-card p-6 rounded-2xl shadow-sm border border-border flex items-center space-x-4">
        <div className="p-3 bg-red-500/10 rounded-xl">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        <div>
          <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Over-allocated People</div>
          <div className="text-4xl font-black text-red-600 drop-shadow-sm">{overAllocated}</div>
          <div className="text-xs text-muted-foreground mt-1">Exceeding 100% capacity</div>
        </div>
      </div>

      <div className="bg-white dark:bg-card p-6 rounded-2xl shadow-sm border border-border flex items-center space-x-4">
        <div className="p-3 bg-green-500/10 rounded-xl">
          <CheckCircle2 className="w-8 h-8 text-green-500" />
        </div>
        <div>
          <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Fully Allocated</div>
          <div className="text-4xl font-black text-emerald-600 drop-shadow-sm">{fullyAllocated}</div>
          <div className="text-xs text-muted-foreground mt-1">Exactly 100% capacity</div>
        </div>
      </div>
    </div>
  );
}
