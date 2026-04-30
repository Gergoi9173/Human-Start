import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { format, addWeeks, subWeeks } from 'date-fns';

export default function WeekPicker({ selectedDate, setSelectedDate, dateString }) {
  const handlePrev = () => setSelectedDate(subWeeks(selectedDate, 1));
  const handleNext = () => setSelectedDate(addWeeks(selectedDate, 1));

  return (
    <div className="flex items-center space-x-4 bg-white dark:bg-card p-4 rounded-xl shadow-sm border border-border">
      <button 
        onClick={handlePrev}
        className="p-2 hover:bg-muted rounded-full transition-colors"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      
      <div className="flex items-center space-x-3 min-w-[200px] justify-center">
        <CalendarIcon className="w-5 h-5 text-primary" />
        <div className="text-center">
          <div className="font-semibold text-lg">{dateString}</div>
          <div className="text-sm text-muted-foreground">Workweek (Monday)</div>
        </div>
      </div>

      <button 
        onClick={handleNext}
        className="p-2 hover:bg-muted rounded-full transition-colors"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
