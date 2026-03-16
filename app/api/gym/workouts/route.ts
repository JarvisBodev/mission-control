import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Discord Iron channel ID
const IRON_CHANNEL_ID = '1478308433823273010';

// Parse workout from Discord message
function parseWorkout(content: string, timestamp: string) {
  const lines = content.split('\n').filter(line => line.trim());
  
  // Extract date from first line (format: "DD de Mês")
  const dateMatch = lines[0]?.match(/(\d{1,2}) de (\w+)/);
  let date = timestamp.split('T')[0]; // fallback to message timestamp
  
  if (dateMatch) {
    const [_, day, monthName] = dateMatch;
    const monthMap: Record<string, string> = {
      'Janeiro': '01', 'Fevereiro': '02', 'Março': '03', 'Abril': '04',
      'Maio': '05', 'Junho': '06', 'Julho': '07', 'Agosto': '08',
      'Setembro': '09', 'Outubro': '10', 'Novembro': '11', 'Dezembro': '12'
    };
    const month = monthMap[monthName];
    if (month) {
      date = `2026-${month}-${day.padStart(2, '0')}`;
    }
  }

  // Determine muscle group from content
  const contentLower = content.toLowerCase();
  let muscleGroup = 'Desconhecido';
  
  if (contentLower.includes('perna') || contentLower.includes('squat') || contentLower.includes('leg press')) {
    muscleGroup = 'Pernas';
  } else if (contentLower.includes('peito') || contentLower.includes('supino') || contentLower.includes('chest')) {
    muscleGroup = 'Peito';
  } else if (contentLower.includes('costa') || contentLower.includes('pulley') || contentLower.includes('remada')) {
    muscleGroup = 'Costas';
  } else if (contentLower.includes('ombro') || contentLower.includes('deltoi') || contentLower.includes('shoulder')) {
    muscleGroup = 'Ombros';
  } else if (contentLower.includes('bíceps') || contentLower.includes('tríceps') || contentLower.includes('braço')) {
    muscleGroup = 'Braços';
  }

  // Extract exercises (lines with weight/reps pattern)
  const exercises: Array<{name: string, sets: string}> = [];
  let currentExercise = '';
  
  for (const line of lines.slice(1)) { // skip date line
    if (line.match(/^\d+\s*x\s*\d+/i)) {
      // This is a set line (e.g., "10 x 20kg")
      if (currentExercise) {
        const existing = exercises.find(e => e.name === currentExercise);
        if (existing) {
          existing.sets += `, ${line.trim()}`;
        } else {
          exercises.push({ name: currentExercise, sets: line.trim() });
        }
      }
    } else if (line.trim() && !line.match(/de \w+$/)) {
      // New exercise name
      currentExercise = line.trim();
    }
  }

  return {
    date,
    muscleGroup,
    exercises,
    summary: exercises.slice(0, 2).map(e => e.name).join(' + ') || 'Treino completo'
  };
}

export async function GET() {
  try {
    // Using Clawdbot message tool to read Discord
    // This is a placeholder - in production, we'd use Discord API or Clawdbot's message tool
    
    // For now, return mock data based on known workouts
    const mockWorkouts = [
      {
        date: '2026-03-13',
        muscleGroup: 'Ombros',
        exercises: [
          { name: 'Deltóide posterior halteres', sets: '4x10x10kg' },
          { name: 'Elevação unilateral polia', sets: '4x10x5-10kg' },
          { name: 'Supersérie elevação lateral', sets: '4x12-15x7.5-10kg' }
        ],
        summary: 'Deltóide posterior + Elevação lateral',
        volume: 12,
        pr: false
      },
      {
        date: '2026-03-12',
        muscleGroup: 'Pernas',
        exercises: [
          { name: 'Belt Squat', sets: '4x10x40-60kg/lado' },
          { name: 'Mesa Flexora', sets: '4x10x12-30kg' },
          { name: 'Leg Press', sets: '3x15x40-50kg/lado' }
        ],
        summary: 'Belt Squat + Flexora + Leg Press',
        volume: 11,
        pr: true,
        prNote: 'PR Belt Squat 60kg/lado'
      },
      {
        date: '2026-03-10',
        muscleGroup: 'Costas & Bíceps',
        exercises: [
          { name: 'Pulldown corda + remada', sets: '4x10-12x20-35kg' },
          { name: 'Pulley frente aberto', sets: '4x10-12x40-59kg' },
          { name: 'Scotch machine', sets: '4x10x18kg' }
        ],
        summary: 'Pulley + Remada + Scotch',
        volume: 12,
        pr: true,
        prNote: 'PR Pulley Aberto 59kg'
      },
      {
        date: '2026-03-09',
        muscleGroup: 'Peito',
        exercises: [
          { name: 'Supino Inclinado', sets: '4x10x10-15kg/lado' },
          { name: 'Supino Reto', sets: '4x10x10-15kg/lado' },
          { name: 'Cable Chest Fly', sets: '4x10x15-20kg/lado' }
        ],
        summary: 'Supino Inclinado + Reto + Fly',
        volume: 12,
        pr: false
      },
      {
        date: '2026-03-07',
        muscleGroup: 'Peito',
        exercises: [
          { name: 'Supino Smith (dropset)', sets: '4x8-12x15kg/lado' },
          { name: 'Crucifixo', sets: '4x10x17.5kg' }
        ],
        summary: 'Supino Dropsets + Crucifixo',
        volume: 8,
        pr: false
      }
    ];

    // Calculate stats
    const totalWorkouts = mockWorkouts.length;
    const marchWorkouts = mockWorkouts.filter(w => w.date.includes('2026-03')).length;
    const totalVolume = mockWorkouts.reduce((sum, w) => sum + w.volume, 0);
    const prCount = mockWorkouts.filter(w => w.pr).length;
    
    const muscleGroupStats = mockWorkouts.reduce((acc, w) => {
      acc[w.muscleGroup] = (acc[w.muscleGroup] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      workouts: mockWorkouts,
      stats: {
        totalWorkouts,
        marchWorkouts,
        totalVolume,
        prCount,
        muscleGroupStats,
        lastWorkout: mockWorkouts[0]?.date,
        frequency: (marchWorkouts / 2).toFixed(1) + 'x/semana' // aproximado
      }
    });
  } catch (error: any) {
    console.error('Gym workouts API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
