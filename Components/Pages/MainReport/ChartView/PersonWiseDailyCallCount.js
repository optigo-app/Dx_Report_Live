import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import { useMemo } from 'react'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

const PersonWiseDailyCallCount = ({ filteredRows }) => {
  const theme = useTheme()

  // 🔹 Transform data
  const { labels, counts, totalCalls } = useMemo(() => {
    const map = {}

    filteredRows.forEach(row => {
      const person =
        row?.receivedBy ||
        row?.AssignedEmpName ||
        row?.callBy ||
        'Unknown'

      map[person] = (map[person] || 0) + 1
    })

    const sorted = Object.entries(map)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    return {
      labels: sorted.map(e => e.name),
      counts: sorted.map(e => e.count),
      totalCalls: sorted.reduce((sum, e) => sum + e.count, 0)
    }
  }, [filteredRows])

  const data = {
    labels,
    datasets: [
      {
        label: 'Daily Calls',
        data: counts,
        maxBarThickness: 18,
        backgroundColor: theme.palette.primary.main
      }
    ]
  }

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: ctx => `Calls: ${ctx.parsed.y}`
        }
      }
    },
    scales: {
      x: {
        ticks: {
          font: { size: 11 }
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0
        }
      }
    }
  }

  return (
    <Card
      sx={{
        boxShadow: '0px 4px 18px rgba(47,43,61,0.1)'
      }}
    >
      <CardHeader
        title='Person Wise Daily Call Count'
        subheader={
          <Typography variant='body2' color='text.disabled'>
            Top 10 persons by calls
          </Typography>
        }
      />

      <CardContent>
        <Bar data={data} height={150} options={options} />

        {/* Summary */}
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant='subtitle1' fontWeight={600}>
            Total Calls
          </Typography>
          <Typography
            variant='h6'
            color='primary.main'
            fontWeight={700}
          >
            {totalCalls}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  )
}

export default PersonWiseDailyCallCount