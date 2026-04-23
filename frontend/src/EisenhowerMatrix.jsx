import React from 'react';
import { updateTarefa, deleteTarefa } from './api';
import { Check, Trash2, Edit3, Move, ArrowRight } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import MeetingTimer from './MeetingTimer';

const TaskCardVisual = React.forwardRef(({ tarefa, index, onUpdate, onEdit, provided, snapshot }, ref) => {
  const toggleStatus = async () => {
    const novoStatus = tarefa.status === 'pendente' ? 'concluida' : 'pendente';
    await updateTarefa(tarefa.id, { status: novoStatus });
    onUpdate();
  };

  const handleDelete = async () => {
    await deleteTarefa(tarefa.id);
    onUpdate();
  };

  const getPriorityColor = () => {
    if (tarefa.status === 'concluida') return 'var(--priority-done)';
    switch(tarefa.prioridade) {
      case 'urgente': return 'var(--priority-urgent)';
      case 'media': return 'var(--priority-medium)';
      case 'baixa': return 'var(--priority-low)';
      default: return 'var(--text-secondary)';
    }
  };

  const [showMoveMenu, setShowMoveMenu] = React.useState(false);

  const moveTask = async (novaPrioridade, novoStatus) => {
    await updateTarefa(tarefa.id, { prioridade: novaPrioridade, status: novoStatus });
    setShowMoveMenu(false);
    onUpdate();
  };

  return (
    <div 
      ref={ref}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      className={snapshot.isDragging ? "dragging-task" : "glass-panel task-card"}
      style={{ 
        padding: '1.2rem', 
        marginBottom: '1rem', 
        borderLeft: `6px solid ${getPriorityColor()}`,
        opacity: tarefa.status === 'concluida' && !snapshot.isDragging ? 0.6 : 1,
        background: snapshot.isDragging ? 'var(--glass-bg)' : 'rgba(255, 255, 255, 0.55)',
        position: 'relative',
        borderRadius: 'var(--radius-md)',
        border: snapshot.isDragging ? '2px solid var(--accent-color)' : '1px solid transparent',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        ...provided.draggableProps.style
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1, paddingRight: '1rem' }}>
          <h4 style={{ margin: '0 0 0.4rem 0', fontSize: '1.05rem', textDecoration: tarefa.status === 'concluida' ? 'line-through' : 'none', color: 'var(--text-primary)' }}>
            {tarefa.titulo}
          </h4>
          {tarefa.descricao && (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.8rem', lineHeight: '1.4' }}>{tarefa.descricao}</p>
          )}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {tarefa.data_limite && (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                ⏱ {new Date(tarefa.data_limite).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}
              </span>
            )}
            {tarefa.categoria_nome && (
                <span style={{ background: tarefa.categoria_cor, color: 'var(--text-inverse)', padding: '3px 8px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 600 }}>
                    {tarefa.categoria_nome}
                </span>
            )}
            {tarefa.tags && tarefa.tags.map((tg, idx) => (
                <span key={idx} style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                    #{tg}
                </span>
            ))}
          </div>
          {tarefa.categoria_nome === 'Reunião' && tarefa.data_limite && (
              <MeetingTimer targetDate={tarefa.data_limite} />
          )}
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button onClick={toggleStatus} style={{ background: tarefa.status === 'concluida' ? 'var(--priority-low)' : 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: tarefa.status === 'concluida' ? 'var(--text-inverse)' : 'var(--text-secondary)', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Check size={16} />
            </button>
            <button onClick={() => onEdit(tarefa)} title="Editar" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Edit3 size={15} />
            </button>
            <div style={{ position: 'relative' }}>
                <button onClick={() => setShowMoveMenu(!showMoveMenu)} title="Mover para..." style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--accent-color)', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Move size={15} />
                </button>
                {showMoveMenu && (
                    <div className="glass-panel" style={{ position: 'absolute', right: '40px', top: '0', zIndex: 100, width: '180px', padding: '0.5rem', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', padding: '0.4rem', fontWeight: 700, textTransform: 'uppercase' }}>Mover para:</p>
                        <button onClick={() => moveTask('urgente', 'pendente')} style={{ width: '100%', textAlign: 'left', padding: '0.5rem', background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--priority-urgent)' }} /> Fazer Agora
                        </button>
                        <button onClick={() => moveTask('media', 'pendente')} style={{ width: '100%', textAlign: 'left', padding: '0.5rem', background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--priority-medium)' }} /> Agendar / Focar
                        </button>
                        <button onClick={() => moveTask('baixa', 'pendente')} style={{ width: '100%', textAlign: 'left', padding: '0.5rem', background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--priority-low)' }} /> Delegar / Depois
                        </button>
                        <button onClick={() => moveTask(tarefa.prioridade, 'concluida')} style={{ width: '100%', textAlign: 'left', padding: '0.5rem', background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                            <Check size={14} color="var(--priority-low)" /> Concluir
                        </button>
                    </div>
                )}
            </div>
            <button onClick={handleDelete} title="Excluir" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: 'var(--priority-urgent)', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Trash2 size={15} />
            </button>
        </div>
      </div>
    </div>
  );
});

function TaskCard({ tarefa, onUpdate, onEdit, index }) {
  return (
    <Draggable draggableId={tarefa.id.toString()} index={index}>
        {(provided, snapshot) => (
           <TaskCardVisual 
              tarefa={tarefa} index={index} onUpdate={onUpdate} onEdit={onEdit} 
              provided={provided} snapshot={snapshot} ref={provided.innerRef} 
           />
        )}
    </Draggable>
  );
}

export default function EisenhowerMatrix({ tarefas, onUpdate, onEditTask }) {
  const quadrante1 = tarefas.filter(t => t.prioridade === 'urgente' && t.status !== 'concluida');
  const quadrante2 = tarefas.filter(t => t.prioridade === 'media' && t.status !== 'concluida');
  const quadrante3 = tarefas.filter(t => t.prioridade === 'baixa' && t.status !== 'concluida');
  const quadrante4 = tarefas.filter(t => t.status === 'concluida');

  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;
    if (source.droppableId === destination.droppableId) return; // Nenhuma mudança de quadrante

    const tarefaTarget = tarefas.find(t => t.id.toString() === draggableId);
    let novoStatus = tarefaTarget.status;
    let novaPrioridade = tarefaTarget.prioridade;

    if (destination.droppableId === "Concluídas") {
        novoStatus = 'concluida';
    } else {
        novoStatus = 'pendente';
        if (destination.droppableId === "Fazer Agora") novaPrioridade = 'urgente';
        else if (destination.droppableId === "Agendar / Focar") novaPrioridade = 'media';
        else if (destination.droppableId === "Delegar / Depois") novaPrioridade = 'baixa';
    }
    
    await updateTarefa(draggableId, { status: novoStatus, prioridade: novaPrioridade });
    onUpdate();
  };

  const Quadrant = ({ title, desc, tasks, color }) => (
    <Droppable 
      droppableId={title}
      renderClone={(provided, snapshot, rubric) => (
        <TaskCardVisual 
          tarefa={tasks[rubric.source.index]} 
          index={rubric.source.index} 
          onUpdate={onUpdate} onEdit={onEditTask} 
          provided={provided} snapshot={snapshot} ref={provided.innerRef} 
        />
      )}
    >
     {(provided, snapshot) => (
        <div 
            ref={provided.innerRef} 
            {...provided.droppableProps}
            className={`glass-panel quadrant-container ${snapshot.isDraggingOver ? 'quadrant-active' : ''}`}
            style={{ 
                padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '100%', minHeight: '400px',
                background: 'var(--glass-bg)',
                ...provided.droppableProps.style
            }}
        >
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ color: color, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.2rem', fontWeight: 600 }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: color, boxShadow: `0 0 10px ${color}` }} />
              {title}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>{desc}</p>
          </div>
          <div style={{ flex: 1, minHeight: '100px' }}>
              {tasks.map((t, idx) => (
                <TaskCard key={t.id.toString()} index={idx} tarefa={t} onUpdate={onUpdate} onEdit={onEditTask} />
              ))}
              {provided.placeholder}
              {tasks.length === 0 && !snapshot.isDraggingOver && (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center', marginTop: '3rem', opacity: 0.5 }}>Solte tarefas aqui.</p>
              )}
          </div>
        </div>
      )}
    </Droppable>
  );

  return (
    <DragDropContext onDragEnd={onDragEnd}>
        <div style={{ 
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', width: '100%', marginTop: '2rem'
        }}>
            <Quadrant title="Fazer Agora" desc="Alta prioridade. Impacto imediato." tasks={quadrante1} color="var(--priority-urgent)" />
            <Quadrant title="Agendar / Focar" desc="Média prioridade. Estratégico." tasks={quadrante2} color="var(--priority-medium)" />
            <Quadrant title="Delegar / Depois" desc="Baixa prioridade. Menos impacto." tasks={quadrante3} color="var(--priority-low)" />
            <Quadrant title="Concluídas" desc="Sucesso e histórico recente." tasks={quadrante4} color="var(--priority-done)" />
        </div>
    </DragDropContext>
  );
}
