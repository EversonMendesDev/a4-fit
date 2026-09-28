'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Dumbbell, Plus, Trash2, CheckCircle2, Users } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ProfessorDashboard() {
  const [alunos, setAlunos] = useState([]);
  const [alunoSelecionado, setAlunoSelecionado] = useState('');
  const [modalidade, setModalidade] = useState('musculacao');
  const [diaSemana, setDiaSemana] = useState(1); // 1 = Segunda
  
  const [exercicios, setExercicios] = useState([
    { exercicio: '', series: 3, repeticoes: '12', carga: '' }
  ]);
  const [sucesso, setSucesso] = useState(false);

  useEffect(() => {
    carregarAlunos();
  }, []);

  const carregarAlunos = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('id, nome, telefone')
      .eq('role', 'aluno')
      .order('nome');
    if (data) setAlunos(data);
  };

  const adicionarLinhaExercicio = () => {
    setExercicios([...exercicios, { exercicio: '', series: 3, repeticoes: '12', carga: '' }]);
  };

  const atualizarExercicio = (index: number, campo: string, valor: any) => {
    const novos = [...exercicios];
    novos[index] = { ...novos[index], [campo]: valor };
    setExercicios(novos);
  };

  const removerExercicio = (index: number) => {
    setExercicios(exercicios.filter((_, i) => i !== index));
  };

  const salvarPrescricao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alunoSelecionado || exercicios.length === 0) return;

    try {
      const { data: treinoData, error: treinoError } = await supabase
        .from('workouts')
        .insert({
          aluno_id: alunoSelecionado,
          modalidade,
          dia_semana: diaSemana,
          concluido: false
        })
        .select()
        .single();

      if (treinoError) throw treinoError;

      const itensFormatados = exercicios.map(item => ({
        workout_id: treinoData.id,
        exercicio: item.exercicio,
        series: Number(item.series),
        repeticoes: item.repeticoes,
        carga: item.carga
      }));

      const { error: itemError } = await supabase
        .from('workout_items')
        .insert(itensFormatados);

      if (itemError) throw itemError;

      setSucesso(true);
      setExercicios([{ exercicio: '', series: 3, repeticoes: '12', carga: '' }]);
      setTimeout(() => setSucesso(false), 4000);
    } catch (err) {
      alert('Erro ao salvar treino. Tente novamente.');
    }
  };

  return (