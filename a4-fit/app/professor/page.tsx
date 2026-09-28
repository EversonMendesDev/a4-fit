'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function ProfessorPage() {
  const [alunos, setAlunos] = useState([]);
  const [alunoSelecionado, setAlunoSelecionado] = useState('');
  const [exercicio, setExercicio] = useState('');
  const [series, setSeries] = useState('');
  const [repeticoes, setRepeticoes] = useState('');
  const [cargatotal, setCargaTotal] = useState('');
  const [mensagem, setMensagem] = useState('');

  useEffect(() => {
    async function carregarAlunos() {
      const { data } = await supabase.from('profiles').select('*').eq('role', 'aluno');
      if (data) setAlunos(data);
    }
    carregarAlunos();
  }, []);

  const salvarTreino = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alunoSelecionado || !exercicio) {
      setMensagem('Selecione um aluno e preencha o exercício.');
      return;
    }

    const { error } = await supabase.from('workouts').insert([
      {
        user_id: alunoSelecionado,
        exercise_name: exercicio,
        sets: series,
        reps: repeticoes,
        load: cargatotal
      }
    ]);

    if (error) {
      setMensagem('Erro ao guardar treino: ' + error.message);
    } else {
      setMensagem('Treino prescrito com sucesso!');
      setExercicio('');
      setSeries('');
      setRepeticoes('');
      setCargaTotal('');
    }
  };

  return (