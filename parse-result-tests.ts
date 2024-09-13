interface TestSummary {
  tests: number
  suites: number
  pass: number
  fail: number
  duration_ms: number
}

export function parseResultTests(tapOutput: string): TestSummary {
  const lines = tapOutput.split('\n')
  const summary: TestSummary = {
    tests: 0,
    suites: 0,
    pass: 0,
    fail: 0,
    duration_ms: 0,
  }

  lines.forEach((line) => {
    if (line.startsWith('# tests')) {
      const match = line.match(/# tests\s*(\d+)/)
      if (match) summary.tests = parseInt(match[1], 10)
    } else if (line.startsWith('# suites')) {
      const match = line.match(/# suites\s*(\d+)/)
      if (match) summary.suites = parseInt(match[1], 10)
    } else if (line.startsWith('# pass')) {
      const match = line.match(/# pass\s*(\d+)/)
      if (match) summary.pass = parseInt(match[1], 10)
    } else if (line.startsWith('# fail')) {
      const match = line.match(/# fail\s*(\d+)/)
      if (match) summary.fail = parseInt(match[1], 10)
    } else if (line.startsWith('# duration_ms')) {
      const match = line.match(/# duration_ms\s*([\d.]+)/)
      if (match) summary.duration_ms = parseFloat(match[1])
    }
  })

  return summary
}

interface TestSummary {
  tests: number
  suites: number
  pass: number
  fail: number
  duration_ms: number
}

export function formatAndDisplaySummary(summary: TestSummary): void {
  console.log('Test Summary:')
  console.table([
    { Metric: 'Tests', Value: summary.tests },
    { Metric: 'Suites', Value: summary.suites },
    { Metric: 'Pass', Value: summary.pass },
    { Metric: 'Fail', Value: summary.fail },
    { Metric: 'Duration (ms)', Value: summary.duration_ms.toFixed(2) },
  ])
}
