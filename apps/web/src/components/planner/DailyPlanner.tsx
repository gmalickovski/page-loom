import { Check } from "lucide-react";
import { useState } from "react";
import { initialTasks, schedule } from "../../data/demoLibrary";
import type { PlannerTask, ScheduleBlock } from "../../types/library";

const scheduleClass: Record<NonNullable<ScheduleBlock["kind"]>, string> = {
  meeting: "time-block--meeting",
  focus: "time-block--focus",
  personal: "time-block--personal",
};

interface DailyPlannerProps {
  compact?: boolean;
}

export function DailyPlanner({ compact = false }: DailyPlannerProps) {
  const [tasks, setTasks] = useState(initialTasks);
  const toggleTask = (id: number) => setTasks((current) => current.map((task) => (task.id === id ? { ...task, done: !task.done } : task)));

  return (
    <section className={`daily-planner ${compact ? "daily-planner--compact" : ""}`}>
      <header className="daily-planner__header">
        <h2>Segunda, 15 de Janeiro</h2>
        <p>Projeto X 2024 · pagina 1 de 12</p>
      </header>

      <div className="daily-planner__body">
        <section className="daily-planner__agenda">
          <h3>Agenda</h3>
          {schedule.map((block) => (
            <TimeBlock key={block.time} block={block} />
          ))}
        </section>

        <section className="daily-planner__tasks">
          <h3>Tarefas do Dia</h3>
          {tasks.map((task) => (
            <TaskItem key={task.id} task={task} onToggle={toggleTask} />
          ))}
          <div className="daily-planner__notes">
            <h3>Notas</h3>
            <div>Adicione notas livres aqui...</div>
          </div>
        </section>
      </div>
    </section>
  );
}

function TimeBlock({ block }: { block: ScheduleBlock }) {
  return (
    <div className="time-block">
      <span>{block.time}</span>
      <div className={block.kind ? scheduleClass[block.kind] : ""}>{block.label}</div>
    </div>
  );
}

function TaskItem({ task, onToggle }: { task: PlannerTask; onToggle: (id: number) => void }) {
  return (
    <button className={`task-item ${task.done ? "is-done" : ""}`} type="button" onClick={() => onToggle(task.id)}>
      <span>{task.done && <Check size={13} strokeWidth={3} />}</span>
      <p>{task.text}</p>
    </button>
  );
}
