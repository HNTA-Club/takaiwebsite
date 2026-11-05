## Introduction

We will discuss here how to allow for the automatic deployment of the Takai Website on a selected VPS.
We assume that the on the VPS:
- user *auto-deploy* exists
- user has home directory
- the proper private key exists for the *auto-deploy*


## Preparing the autodeployment

- git clone the repo into the home directory - so that it is in */home/auto-deploy/takaiwebsite*
- copy *deploy_website.sh* into home directory - */home/auto-deploy*
- test the *deploy_website.sh* by manually running it.
   - It should build Your docker image and run it
   - You should be able to preview the website on http://10.63.192.129:3000
- prepare the *ssh* environment in github, and add two variables - *SSH_USER*, *SSH_HOST* and one secret, *KEY*.
- Take a look at workflow file - *.github/workflows/deploy.yml*, You can find example in this document. It already exists in the repo, but modify it if needed.


## Example deploy.yml

The following example, executes the */home/auto-deploy/deploy_website.sh*, EVERY time someone pushes the changes to the repo.
The environment *ssh* should be created in github repo settings, and variables *SSH_USER*, *SSH_HOST* have to be set, as well as secret *KEY*, that github can use to access the VPS - in order to execute deployment script.
```
on:
  push:
    branches:
      - docker-deployment

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: ssh
    steps:
      - name: Run script on server
        run: |
          mkdir -p ~/.ssh
          echo "${{ secrets.KEY }}" > ~/.ssh/key
          chmod 600 ~/.ssh/key
          ssh -i ~/.ssh/key -o StrictHostKeyChecking=accept-new \
            "${{ vars.SSH_USER }}@${{ vars.SSH_HOST }}" \
            "/home/${{ vars.SSH_USER }}/deploy_website.sh"
```
This file is already part of the repo, the description just acknowledges it's role
