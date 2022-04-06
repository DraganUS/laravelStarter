import chalk from 'chalk';
import inquirer from 'inquirer';
import gradient from 'gradient-string';
import chalkAnimation from 'chalk-animation';
import figlet from 'figlet';
import { createSpinner } from 'nanospinner';

let projectName;
let dbName;

const sleep = (ms = 1000) => new Promise((r) => setTimeout(r, ms));

import { exec } from 'child_process';

/**
 * Execute simple shell command (async wrapper).
 * @param {String} cmd
 * @return {Object} { stdout: String, stderr: String }
 */
async function sh(cmd) {
  return new Promise(function (resolve, reject) {
    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        reject(err);
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
}

async function welcome() {
  const rainbowTitle = chalkAnimation.rainbow(
    ' Hallo Artisans \n'
  );

  await sleep();
  rainbowTitle.stop();

  console.log(`
    ${chalk.bgBlue('Laravel Starter')} 
  `);

}

async function askProjectName() {
  const userInput = await inquirer.prompt({
    name: 'project_name',
    type: 'input',
    message: 'Project name: ',
    default() {
      return 'newLaravelProject';
    },
  });

  projectName = userInput.project_name;
}

async function installLaravelCommand(selectedCommand) {
  const spinner = createSpinner().start();
  await sleep();
  var { stdout } = await sh(`${selectedCommand}`);
  console.log(stdout)
  spinner.success({ text: `${projectName} created` });
  spinner.start();
  var { stdout } = await sh(`cd ${projectName} && composer install && npm install`);
  console.log(stdout)
  spinner.success({ text: `composer & npm installed` });
  console.clear();
}

async function createDB() {
  const userInput = await inquirer.prompt({
    name: 'db_confirmed',
    type: 'confirm',
    message: `You need to create DB table - ${dbName}`,
  });
  if (userInput.db_confirmed){
    let { stdout } = await sh(`cd ${dbName} && php artisan migrate`);
    console.log(stdout)
  }
}

async function jetsteamInstalation() {
  const spinner = createSpinner('install jetstream').start();
  await sleep();
  let {stdout} = await sh(`cd ${projectName} && composer require laravel/jetstream`);
  console.log(stdout)
  spinner.success({ text: `jetstream installed` });
}

async function installInertia(command) {
  let { stdout } = await sh(`
  cd ${projectName} &&
   ${command} && 
  npm install && 
  npm run dev`);
  console.log(stdout)
}

async function installLivewire(command) {
  let { stdout } = await sh(`
  cd ${projectName} &&
   ${command} && 
  npm install && 
  npm run dev  &&  
  php artisan vendor:publish --tag=jetstream-views`);
  console.log(stdout)
}

async function selectInstallation() {
  const userInput = await inquirer.prompt({
    name: 'select_installation',
    type: 'list',
    message: 'Installation select\n',
    choices: [
      'Installation Via Composer',
      'The Laravel Installer'
    ],
  });
  switch (userInput.select_installation) {
    case 'Installation Via Composer':
      dbName = 'Laravel'
      return installLaravelCommand( `composer create-project laravel/laravel ${projectName}`)
      break;
    case 'The Laravel Installer':
      dbName = projectName
      return installLaravelCommand(`laravel new ${projectName}`)
      break;
  }
}

async function selectJetstreamInstallation() {
  const userInput = await inquirer.prompt({
    name: 'select_jetstream_installation',
    type: 'list',
    message: 'Jetstream select\n',
    choices: [
      'Livewire',
      'Inertia.js'
    ],
  });

  const withTeam = await inquirer.prompt({
    name: 'team',
    type: 'list',
    message: 'With Team\n',
    choices: ['Yes', 'No'],
  });

  console.log(userInput.select_jetstream_installation)
  if (userInput.select_jetstream_installation === 'Livewire'){
      let livewireCommand;
      if (withTeam.team == 'Yes'){
        livewireCommand = 'php artisan jetstream:install livewire --teams'
      } else if(withTeam.team == 'No'){
        livewireCommand = 'php artisan jetstream:install livewire'
      }
      installLivewire(livewireCommand)

  } else if (userInput.select_jetstream_installation === 'Inertia.js'){
      let inertiaCommand;
      if (withTeam.team == 'Yes'){
        inertiaCommand = 'php artisan jetstream:install inertia --teams'
      } else if(withTeam.team == 'No'){
        inertiaCommand = 'php artisan jetstream:install inertia'
      }
      installInertia(inertiaCommand)
  }
  
}

function winner() {
  console.clear();
  figlet(`\n ${projectName} \n`, (err, data) => {
    console.log(gradient.pastel.multiline(data) + '\n');

    console.log(
      chalk.green(
        `Write code for the joy of it  🦄`
      )
    );
    process.exit(0);
  });
}

console.clear();
await welcome();
await askProjectName();
await selectInstallation();
await createDB()
await jetsteamInstalation();
await selectJetstreamInstallation();
winner();
