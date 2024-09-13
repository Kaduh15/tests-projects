import readline from 'node:readline'
import { exec as execCb } from 'node:child_process'
import { promisify } from 'node:util'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { stdin as input, stdout as output } from 'node:process'
import { formatAndDisplaySummary, parseResultTests } from './parse-result-tests'

const exec = promisify(execCb)

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const REPOSITORY_PATH = path.resolve(__dirname, 'repositories')
const envFilePath = path.resolve(__dirname, '.env.exemple')

const rl = readline.createInterface({ input, output })

interface GitHubInfo {
  username: string
  repositoryName: string
}

async function main(): Promise<void> {
  rl.question('Qual a URL do projeto? ', async (url: string) => {
    const projectName = url.trim()
    const { username } = extractGithubInfo(projectName)
    const destinationDir = path.join(REPOSITORY_PATH, username)

    try {
      if (!existsSync(destinationDir)) {
        await cloneAndSetupProject(url, destinationDir)
      }

      await startDocker(username)
      await waitForDockerToBeReady()
      await runTests()

      console.log('Processo concluído com sucesso!')
    } catch (error) {
      handleError(error)
    } finally {
      rl.close()
    }
  })
}

async function cloneAndSetupProject(
  url: string,
  destinationDir: string,
): Promise<void> {
  console.log('Fazendo clone do projeto...')
  await exec(`git clone ${url} ${destinationDir}`)

  console.log('Entrando no diretório do projeto e instalando dependências...')
  await exec(`cd ${destinationDir} && npm install`)

  console.log('Removendo .git')
  await exec(`rm -rf ${destinationDir}/.git`)

  console.log('Copiando o arquivo .env...')
  await exec(`cp ${envFilePath} ${path.join(destinationDir, '.env')}`)
}

async function startDocker(username: string): Promise<void> {
  console.log('Iniciando o Docker...')
  await exec(
    `cd ${REPOSITORY_PATH}/${username} && docker compose up -d --build`,
  )
}

async function waitForDockerToBeReady(): Promise<void> {
  let isDockerReady = false
  let count = 0

  while (!isDockerReady) {
    await new Promise((resolve) => setTimeout(resolve, 2000))
    console.log('Aguardando o Docker...')
    console.clear()

    const { stdout } = await exec('docker ps')
    isDockerReady = checkDockerStatus(stdout)

    if (++count > 60) {
      throw new Error('O Docker não está pronto.')
    }
  }

  console.log(
    'Docker está pronto e os containers estão funcionando corretamente!',
  )
  console.log('Aguardando 5 segundos...')
  await new Promise((resolve) => setTimeout(resolve, 5000))
}

async function runTests(): Promise<void> {
  console.log('Iniciando o teste...')
  try {
    const { stdout } = await exec('tsx --test ./__tests__/*.test.ts')
    const data = parseResultTests(stdout)
    formatAndDisplaySummary(data)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    const data = parseResultTests(err.stdout)
    formatAndDisplaySummary(data)
  }
}

function extractGithubInfo(githubUrl: string): GitHubInfo {
  const parsedUrl = new URL(githubUrl)
  const pathParts = parsedUrl.pathname.split('/').filter((part) => part)

  if (pathParts.length === 2) {
    const [username, repositoryName] = pathParts
    return { username, repositoryName }
  } else {
    throw new Error('URL inválida para o formato de repositório do GitHub.')
  }
}

function checkDockerStatus(dockerPsOutput: string): boolean {
  return dockerPsOutput
    .split('\n')
    .slice(1)
    .filter((line) => line.trim() !== '')
    .every((line) => {
      const status = line.split(/\s{2,}/)[4]
      return status && (status.startsWith('Up') || status.includes('healthy'))
    })
}

function handleError(error: unknown): void {
  if (error instanceof Error) {
    console.error(`Erro: ${error.message}`)
  } else {
    console.error('Erro desconhecido')
  }
}

main()
