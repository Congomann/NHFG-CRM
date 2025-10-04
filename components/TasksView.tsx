import React, { useState, useMemo } from 'react';
import { Task, Client } from '../types';
import { PlusIcon } from './icons';
import AddEditTaskModal from './AddEditTaskModal';

interface TasksViewProps {
  tasks: Task[];
  clients: Client[];
  onSaveTask: (task: Omit<Task, 'id' | 'completed'> & { id?: number }) => void;
  onToggleTask: (taskId: number) => void;
  onSelectClient: (clientId: number) => void;
}

type FilterStatus = 'all' | 'active' | 'completed';

const TasksView: React.FC<TasksViewProps> = ({ tasks, clients, onSaveTask, onToggleTask, onSelectClient }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [filter, setFilter] = useState<FilterStatus>('active');

  const clientMap = useMemo(() => {
    return clients.reduce((map, client) => {
      map[client.id] = `${client.firstName} ${client.lastName}`;
      return map;
    }, {} as Record<number, string>);
  }, [clients]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (filter === 'active') return !task.completed;
      if (filter === 'completed') return task.completed;
      return true;
    }).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [tasks, filter]);

  const handleAddTaskClick = () => {
    setTaskToEdit(null);
    setIsModalOpen(true);
  };

  const handleEditTaskClick = (task: Task) => {
    setTaskToEdit(task);
    setIsModalOpen(true);
  };

  const getDueDateColor = (dueDate: string, completed: boolean) => {
    if (completed) return 'text-slate-500';
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [year, month, day] = dueDate.split('-').map(Number);
    // Month in Date constructor is 0-indexed, so subtract 1
    const due = new Date(year, month - 1, day);

    if (due < today) {
      return 'text-rose-600 font-semibold';
    }
     if (due.getTime() === today.getTime()) {
      return 'text-amber-600 font-semibold';
    }
    
    return 'text-slate-500';
  };
  
  const FilterButton: React.FC<{buttonFilter: FilterStatus, label: string}> = ({ buttonFilter, label }) => (
    <button
      onClick={() => setFilter(buttonFilter)}
      className={`px-4 py-2 text-sm font-medium rounded-md shadow-sm button-press ${filter === buttonFilter ? 'bg-primary-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-300'}`}
    >
      {label}
    </button>
  );

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-slate-800">Tasks</h1>
        <button onClick={handleAddTaskClick} className="flex items-center bg-primary-600 text-white font-semibold px-4 py-2 rounded-md shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 button-press">
          <PlusIcon className="w-5 h-5 mr-2" />
          Add Task
        </button>
      </div>
      
      <div className="mb-6 flex space-x-2">
        <FilterButton buttonFilter="active" label="Active" />
        <FilterButton buttonFilter="completed" label="Completed" />
        <FilterButton buttonFilter="all" label="All" />
      </div>

      <div className="bg-white rounded-lg border border-slate-200">
        <ul className="divide-y divide-slate-200">
          {filteredTasks.length > 0 ? filteredTasks.map(task => (
            <li key={task.id} className={`p-4 flex items-center justify-between hover:bg-slate-50 transition-all duration-500 ease-in-out ${task.completed ? 'opacity-50' : 'opacity-100'}`}>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => onToggleTask(task.id)}
                  className="h-5 w-5 rounded border-slate-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                />
                <div className="ml-4">
                  <p className={`font-medium text-slate-800 transition-all duration-500 ${task.completed ? 'line-through text-slate-500' : ''}`}>{task.title}</p>
                  <div className="flex items-center text-sm">
                    <span className={getDueDateColor(task.dueDate, task.completed)}>Due: {task.dueDate}</span>
                    {task.clientId && clientMap[task.clientId] && (
                        <>
                            <span className="mx-2 text-slate-300">|</span>
                            <button onClick={() => onSelectClient(task.clientId!)} className="text-primary-600 hover:underline">{clientMap[task.clientId]}</button>
                        </>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <button onClick={() => handleEditTaskClick(task)} className="text-sm text-primary-600 hover:underline px-2 py-1">Edit</button>
              </div>
            </li>
          )) : (
            <li className="p-6 text-center text-slate-500">No tasks found for this filter.</li>
          )}
        </ul>
      </div>

      <AddEditTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={onSaveTask}
        taskToEdit={taskToEdit}
        clients={clients}
      />
    </div>
  );
};

export default TasksView;
