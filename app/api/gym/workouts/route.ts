import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Real workouts from Discord Iron channel (parsed manually for accuracy)
    const workouts = [
      {
        date: '2026-03-19',
        muscleGroup: 'Costas & Bíceps',
        prNote: '🏆 2x PR! Pulley Frente 64kg (anterior 59kg) + Rosca Máquina 24kg (anterior 18kg)',
        exercises: [
          {
            name: 'Pulldown barra fixa',
            sets: ['12 x 25kg', '12 x 30kg', '12 x 35kg', '12 x 40kg']
          },
          {
            name: '🏆 Pulley frente barra aberta',
            sets: ['10 x 40kg', '10 x 48kg', '10 x 56kg', '10 x 64kg * ajuda últimas 5 (PR!)']
          },
          {
            name: 'Remada unilateral máquina',
            sets: ['10 x 20kg cada lado', '10 x 25kg cada lado', '10 x 30kg cada lado', '10 x 30kg cada lado']
          },
          {
            name: 'Remada curvada barra reta + rosca haltere alternada',
            sets: ['10 x 20kg + 10 x 10kg cada braço', '10 x 25kg + 10 x 10kg cada braço', '10 x 25kg + 10 x 12.5kg cada braço']
          },
          {
            name: '🏆 Rosca na máquina + pulley frontal barra fechada',
            sets: ['10 x 18kg + 10 x 40kg', '10 x 24kg + 10 x 40kg (PR!)', '10 x 24kg + 10 x 48kg', '10 x 24kg + 10 x 48kg']
          }
        ]
      },
      {
        date: '2026-03-17',
        muscleGroup: 'Peito & Ombros',
        prNote: null,
        statusNote: 'Gripado e 4h de sono',
        exercises: [
          {
            name: 'Incline upper chest máquina',
            sets: ['12 x 20kg cada lado', '12 x 25kg cada lado', '12 x 30kg cada lado', '10 x 35kg cada lado']
          },
          {
            name: 'Bench press máquina',
            sets: ['12 x 25kg cada lado', '12 x 25kg cada lado', '12 x 30kg cada lado']
          },
          {
            name: 'Crucifixo com halteres',
            sets: ['12 x 15kg cada lado', '12 x 17.5kg cada lado', '12 x 17.5kg cada lado']
          },
          {
            name: 'Crossover polia alta + elevação lateral c/ halteres',
            sets: ['12 x 20kg cada lado + 12 x 6kg cada lado', '12 x 20kg cada lado + 12 x 6kg cada lado', '12 x 20kg cada lado + 12 x 6kg cada lado']
          },
          {
            name: 'Elevação frontal c/ halteres + shoulder press máquina',
            sets: ['12 x 6kg cada lado + 12 x 15kg cada lado', '12 x 6kg cada lado + 12 x 20kg cada lado', '12 x 6kg cada lado + 12 x 20kg cada lado']
          }
        ]
      },
      {
        date: '2026-03-13',
        muscleGroup: 'Ombros',
        prNote: null,
        exercises: [
          {
            name: 'Deltóide posterior halteres',
            sets: ['10 x 10kg cada lado', '10 x 10kg cada lado', '10 x 10kg cada lado', '10 x 10kg cada lado']
          },
          {
            name: 'Elevação unilateral na polia',
            sets: ['10 x 5kg', '10 x 8kg', '10 x 10kg', '10 x 10kg']
          },
          {
            name: 'Super série elevação lateral com halteres',
            sets: ['15 x 7,5kg + 15 x 2,5kg', '15 x 7,5kg + 15 x 2,5kg', '12 x 10kg + 12 x 5kg', '12 x 10kg + 12 x 5kg']
          },
          {
            name: 'Circuito (3x)',
            sets: ['20 abdominais com peso 10kg', 'Elevação frontal halteres 10 x 10kg', 'Press ombros barra 22kg']
          },
          {
            name: 'Press de ombros máquina',
            sets: ['15 x 25kg cada lado', '10 x 30kg cada lado', '12 x 32kg cada lado']
          }
        ]
      },
      {
        date: '2026-03-12',
        muscleGroup: 'Pernas',
        prNote: '🏆 PR Belt Squat 60kg/lado',
        exercises: [
          {
            name: '🏆 Belt squat',
            sets: ['10 x 40kg cada lado', '10 x 50kg cada lado', '10 x 60kg cada lado (PR!)', '10 x 60kg cada lado']
          },
          {
            name: 'Flexora',
            sets: ['10 x 12kg', '10 x 18kg', '10 x 24kg', '10 x 30kg']
          },
          {
            name: 'Búlgaro com Saco de 20kg',
            sets: ['10 x 10 cada perna', '10 x 10 cada perna', '10 x 10 cada perna', '10 x 10 cada perna']
          },
          {
            name: 'Leg press',
            sets: ['15 x 40kg cada lado', '15 x 50kg cada lado', '15 x 50kg cada lado']
          },
          {
            name: 'Extensora',
            sets: ['15 x 50kg', '15 x 50kg', '15 x 55kg']
          }
        ]
      },
      {
        date: '2026-03-10',
        muscleGroup: 'Costas & Bíceps',
        prNote: '🏆 PR Pulley Aberto 59kg',
        exercises: [
          {
            name: 'Pulldown corda + remada baixa na polia',
            sets: ['12 x 25kg + 12 x 20kg', '12 x 30kg + 12 x 25kg', '12 x 35kg + 12 x 30kg', '10 x 35kg + 10 x 30kg']
          },
          {
            name: '🏆 Pulley frente aberto',
            sets: ['12 x 40kg', '10 x 48kg', '10 x 56kg', '10 x 59kg (PR!)']
          },
          {
            name: 'Remada baixa com halteres',
            sets: ['12 x 25kg cada lado', '12 x 27,5kg cada lado', '12 x 30kg cada lado']
          },
          {
            name: 'Remada baixa barra reta',
            sets: ['10 x 40kg', '10 x 45kg', '10 x 50kg', '10 x 55kg']
          },
          {
            name: 'Pulley fechado na polia',
            sets: ['10 x 40kg', '10 x 48kg', '10 x 48kg', '10 x 48kg']
          },
          {
            name: 'Scotch machine (bicep)',
            sets: ['10 x 18kg', '10 x 18kg', '10 x 18kg', '10 x 18kg']
          }
        ]
      },
      {
        date: '2026-03-09',
        muscleGroup: 'Peito',
        prNote: null,
        exercises: [
          {
            name: 'Supino inclinado (upper chest)',
            sets: ['12 x 10kg cada lado', '10 x 15kg cada lado', '10 x 15kg cada lado', '10 x 15kg cada lado (ajuda 4 últimas)']
          },
          {
            name: 'Supino reto',
            sets: ['12 x 10kg cada lado', '10 x 15kg cada lado', '10 x 15kg cada lado', '10 x 15kg cada lado']
          },
          {
            name: 'Crucifixo halteres + kettlebell lift upper chest',
            sets: ['10 x 17,5kg + 10 x 16kg', '10 x 17,5kg + 10 x 16kg', '10 x 17,5kg + 10 x 16kg']
          },
          {
            name: 'Cable chest fly + peito barra paralela',
            sets: ['10 x 15kg cada lado + 10 x 20kg cada lado', '10 x 15kg cada lado + 10 x 20kg cada lado', '10 x 15kg cada lado + 10 x 20kg cada lado', '10 x 15kg cada lado + 10 x 20kg cada lado']
          }
        ]
      },
      {
        date: '2026-03-07',
        muscleGroup: 'Peito',
        prNote: null,
        exercises: [
          {
            name: 'Incline chest smith machine',
            sets: ['15 x 5kg cada lado', '13 x 10kg cada lado', '9 x 15kg cada lado', '3 x 20kg + 8 x 10kg cada lado', '3 x 20kg + 8 x 10kg cada lado + 15 parciais', '10 x 5kg cada lado rest pause 2s']
          },
          {
            name: 'Supino reto smith machine (Dropset)',
            sets: ['13 x 5kg cada lado', '8 x 15kg + 8 x 10kg + 10 x 5kg cada lado', '8 x 15kg + 5 x 10kg + 8 x 5kg cada lado', '5 x 15kg + 5 x 10kg + 8 x 5kg cada lado']
          },
          {
            name: 'Crossover lower chest (Dropset)',
            sets: ['10x 15kg + 10 x 10kg', '10x 15kg + 10 x 10kg', '10x 15kg + 10 x 10kg', '10x 15kg + 10 x 10kg']
          }
        ]
      },
      {
        date: '2026-03-06',
        muscleGroup: 'Ombros & Braços',
        prNote: null,
        exercises: [
          {
            name: 'Gémeo máquina',
            sets: ['15 x 45kg cada lado', '15 x 45kg cada lado', '15 x 45kg cada lado']
          },
          {
            name: 'Elevação frontal e press com barra (20kg)',
            sets: ['10 x 7,5kg cada lado + 12 * 2,5kg cada lado', '10 x 10kg cada lado + 12 * 5kg cada lado', '10 x 7,5kg cada lado + 12 * 7,5kg cada lado', '10 x 7,5kg cada lado + 12 * 7,5kg cada lado + 10 x barra']
          },
          {
            name: 'Elevação lateral na polia pela frente',
            sets: ['10 x 5kg cada lado', '10 x 8kg cada lado', '10 x 8kg cada lado', '10 x 8kg cada lado']
          },
          {
            name: 'Elevação lateral alteres',
            sets: ['15 x 7,5kg cada lado', '15 x 7,5kg cada lado', '15 x 7,5kg cada lado', '15 x 7,5kg cada lado']
          },
          {
            name: 'Rosca direta barra w + deltóide na polia alta',
            sets: ['12 x 8kg cada lado + 10 x 20kg', '12 x 10kg cada lado + 12 x 20kg']
          }
        ]
      },
      {
        date: '2026-03-05',
        muscleGroup: 'Pernas',
        prNote: null,
        exercises: [
          {
            name: 'Agachamento com barra',
            sets: ['10 x 10kg de cada lado', '10 x 15kg de cada lado', '10 x 20kg de cada lado', '10 x 30kg de cada lado', '10 x 35kg de cada lado']
          },
          {
            name: 'Stiff com barra',
            sets: ['10 x 20kg de cada lado', '10 x 25kg de cada lado', '10 x 25kg de cada lado', '10 x 25kg de cada lado']
          },
          {
            name: 'Flexora máquina',
            sets: ['15 x 12kg', '15 x 18kg', '15 x 24kg (com ajuda)']
          },
          {
            name: 'Leg press 90g máquina',
            sets: ['10 x 40kg cada lado', '10 x 50kg cada lado', '10 x 50kg cada lado', '10 x 50kg cada lado']
          },
          {
            name: 'Leg extension + passadas',
            sets: ['10 x 18kg + 20 passadas', '10 x 24kg + 20 passadas', '10 x 24kg + 20 passadas', '10 x 24kg + 20 passadas']
          }
        ]
      },
      {
        date: '2026-03-03',
        muscleGroup: 'Costas',
        prNote: '🏆 PR Pulley Fechado 64kg',
        exercises: [
          {
            name: 'Barra Fixa (Elevações)',
            sets: ['10 reps c/ ajuda', '10 reps c/ ajuda', '10 reps c/ ajuda', '10 reps c/ ajuda']
          },
          {
            name: 'Superset Pulldown Corda + Remada Curvada Barra W',
            sets: ['12 x 30kg + 12 x 18.5kg', '12 x 30kg + 12 x 18.5kg', '12 x 33.5kg + 12 x 20kg']
          },
          {
            name: '🏆 Pulley Fechado',
            sets: ['10 x 40kg', '10 x 48kg', '10 x 56kg (ajuda últimas 2)', '10 x 64kg (ajuda últimas 5) - PR!']
          },
          {
            name: 'Remada Baixa Unilateral Máquina',
            sets: ['10 x 20kg', '10 x 25kg', '10 x 27kg']
          },
          {
            name: 'Remada Baixa Barra Aberta (Polia)',
            sets: ['12 x 30kg', '12 x 45kg', '10 x 50kg', '10 x 55kg']
          }
        ]
      },
      {
        date: '2026-03-02',
        muscleGroup: 'Peito & Tríceps',
        prNote: '🏆 PR Supino Inclinado 37.5kg',
        exercises: [
          {
            name: '🏆 Supino Inclinado Máquina',
            sets: ['15 x 20kg (warmup)', '12 x 30kg', '10 x 35kg', '10 x 37.5kg (PR!)']
          },
          {
            name: 'Supino Máquina',
            sets: ['12 x 25kg', '10 x 30kg', '10 x 32.5kg', '10 x 35kg']
          },
          {
            name: 'Crucifixo Reto',
            sets: ['12 x 17.5kg', '12 x 20kg', '12 x 20kg', '10 x 20kg']
          },
          {
            name: 'Cable Flies Superior',
            sets: ['15 x 15kg', '10 x 20kg', '12 x 20kg', '12 x 20kg']
          },
          {
            name: 'Tríceps Polia Unilateral',
            sets: ['10 x 10kg', '10 x 10kg', '10 x 10kg', '10 x 10kg']
          },
          {
            name: 'Superset Tríceps Barra + Corda',
            sets: ['10 x 30kg + 10 x 20kg', '10 x 30kg + 10 x 20kg', '10 x 30kg + 10 x 20kg', '10 x 30kg + 10 x 20kg']
          }
        ]
      }
    ];

    // Calculate stats
    const marchWorkouts = workouts.length;
    const totalSets = workouts.reduce((sum, w) => sum + w.exercises.reduce((s, e) => s + e.sets.length, 0), 0);
    const prCount = workouts.filter(w => w.prNote).length;
    
    const muscleGroupStats = workouts.reduce((acc, w) => {
      acc[w.muscleGroup] = (acc[w.muscleGroup] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      workouts,
      stats: {
        marchWorkouts,
        totalSets,
        prCount,
        muscleGroupStats,
        lastWorkout: workouts[0]?.date,
        frequency: (marchWorkouts / 2).toFixed(1) + 'x/semana'
      }
    });
  } catch (error: any) {
    console.error('Gym workouts API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}