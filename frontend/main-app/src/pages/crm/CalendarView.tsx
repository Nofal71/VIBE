import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';

interface Task {
    id: string;
    title: string;
    due_date: string;
    status: 'TODO' | 'IN_PROGRESS' | 'DONE';
}

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const statusColors: Record<string, string> = {
    TODO: 'bg-gray-200 text-gray-700',
    IN_PROGRESS: 'bg-blue-100 text-blue-700',
    DONE: 'bg-green-100 text-green-700',
};

const CalendarView: React.FC = () => {
    const now = new Date();
    const [viewYear, setViewYear] = useState(now.getFullYear());
    const [viewMonth, setViewMonth] = useState(now.getMonth());
    const [tasks, setTasks] = useState<Task[]>([]);
    const [selectedDay, setSelectedDay] = useState<number | null>(null);

    useEffect(() => {
        api.get('/tasks')
            .then((res) => setTasks(res.data.tasks || []))
            .catch(() => {
                setTasks([
                    { id: 't-1', title: 'Client Follow-Up Call', due_date: `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-15`, status: 'TODO' },
                    { id: 't-2', title: 'Property Viewing', due_date: `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-22`, status: 'IN_PROGRESS' },
                    { id: 't-3', title: 'Submit Visa Docs', due_date: `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-28`, status: 'DONE' },
                ]);
            });
    }, [viewMonth, viewYear]);

    const prevMonth = () => {
        if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
        else setViewMonth(viewMonth - 1);
    };
    const nextMonth = () => {
        if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
        else setViewMonth(viewMonth + 1);
    };

    const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    const getTasksForDay = (day: number): Task[] => {
        const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return tasks.filter((t) => t.due_date?.startsWith(dateStr));
    };

    const selectedDayTasks = selectedDay ? getTasksForDay(selectedDay) : [];
    const isToday = (day: number) =>
        day === now.getDate() && viewMonth === now.getMonth() && viewYear === now.getFullYear();

    
    const cells: (number | null)[] = [
        ...Array(firstDayOfMonth).fill(null),
        ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];
    
    while (cells.length % 7 !== 0) cells.push(null);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Calendar</h1>
                <div className="flex items-center space-x-4">
                    <button onClick={prevMonth} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100 transition text-gray-600 font-bold">←</button>
                    <span className="text-lg font-extrabold text-gray-800 min-w-[180px] text-center">
                        {MONTHS[viewMonth]} {viewYear}
                    </span>
                    <button onClick={nextMonth} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100 transition text-gray-600 font-bold">→</button>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {}
                <div className="grid grid-cols-7 border-b border-gray-100">
                    {DAYS_OF_WEEK.map((d) => (
                        <div key={d} className="py-3 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">
                            {d}
                        </div>
                    ))}
                </div>

                {}
                <div className="grid grid-cols-7">
                    {cells.map((day, idx) => {
                        const dayTasks = day ? getTasksForDay(day) : [];
                        const selected = day === selectedDay;

                        return (
                            <div
                                key={idx}
                                className={`min-h-[100px] border-b border-r border-gray-50 p-2 cursor-pointer transition
                  ${!day ? 'bg-gray-50/50' : 'hover:bg-blue-50/40'}
                  ${selected ? 'ring-2 ring-inset ring-blue-400 bg-blue-50/60' : ''}
                `}
                                onClick={() => day && setSelectedDay(selected ? null : day)}
                            >
                                {day && (
                                    <>
                                        <div className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-bold mb-1 mx-auto transition
                      ${isToday(day) ? 'bg-blue-600 text-white shadow' : 'text-gray-700 hover:bg-gray-200'}`}
                                        >
                                            {day}
                                        </div>
                                        <div className="space-y-1">
                                            {dayTasks.slice(0, 2).map((task) => (
                                                <div
                                                    key={task.id}
                                                    className={`text-xs px-1.5 py-0.5 rounded font-semibold truncate ${statusColors[task.status]}`}
                                                    title={task.title}
                                                >
                                                    {task.title}
                                                </div>
                                            ))}
                                            {dayTasks.length > 2 && (
                                                <div className="text-xs text-gray-400 font-medium pl-1">+{dayTasks.length - 2} more</div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {}
            {selectedDay && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 className="font-extrabold text-gray-900 text-lg mb-4">
                        Tasks on {MONTHS[viewMonth]} {selectedDay}, {viewYear}
                    </h3>
                    {selectedDayTasks.length === 0 ? (
                        <p className="text-gray-400 text-sm">No tasks scheduled for this day.</p>
                    ) : (
                        <div className="space-y-3">
                            {selectedDayTasks.map((task) => (
                                <div key={task.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50">
                                    <span className="font-semibold text-gray-800 text-sm">{task.title}</span>
                                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusColors[task.status]}`}>
                                        {task.status.replace('_', ' ')}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CalendarView;
