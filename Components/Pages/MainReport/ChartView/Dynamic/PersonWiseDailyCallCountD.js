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

const PersonWiseDailyCallCountD = ({ filteredRows, chartDataD }) => {
  const theme = useTheme()
  const { labels, counts, totalCalls } = useMemo(() => {
    if (!filteredRows?.length) {
      return { labels: [], counts: [], totalCalls: 0 }
    }

    const xCol = chartDataD?.xAxisColumn
    const yCol = chartDataD?.yAxiosColumn

    const map = {}

    filteredRows.forEach(row => {

      const xValue = row[xCol] ?? "Unknown"

      let yValue = 1

      if (yCol && !isNaN(Number(row[yCol]))) {
        yValue = Number(row[yCol])
      }

      map[xValue] = (map[xValue] || 0) + yValue

    })

    const sorted = Object.entries(map)
      .map(([name, value]) => ({
        name,
        value
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10)

    return {
      labels: sorted.map(e => e.name),
      counts: sorted.map(e => e.value),
      totalCalls: sorted.reduce((sum, e) => sum + e.value, 0)
    }

  }, [filteredRows, chartDataD])

  const data = {
    labels,
    datasets: [
      {
        label: chartDataD?.yAxiosColumn || "Count",
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
          label: ctx => `${chartDataD?.yAxiosColumn}: ${ctx.parsed.y}`
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
    <Card sx={{ boxShadow: '0px 4px 18px rgba(47,43,61,0.1)' }}>
      <CardHeader
        title={`Top 10 ${chartDataD?.xAxisColumn}`}
        subheader={
          <Typography variant='body2' color='text.disabled'>
            Based on {chartDataD?.yAxiosColumn}
          </Typography>
        }
      />

      <CardContent>
        <Bar data={data} height={150} options={options} />
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant='subtitle1' fontWeight={600}>
            Total
          </Typography>
          <Typography variant='h6' color='primary.main' fontWeight={700}>
            {totalCalls}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  )
}

export default PersonWiseDailyCallCountD