## Introduction

We will discuss here how to allow for the automatic deployment of the Takai Website on a selected VPS.
We assume that the on the VPS:

- user _auto-deploy_ exists
- user has home directory
- the proper private key exists for the _auto-deploy_

## Preparing the autodeployment

- git clone the repo into the home directory - so that it is in _/home/auto-deploy/takaiwebsite_
- test the _deploy_website.sh_ by manually running it.
  - It should build Your docker image and run it
  - You should be able to preview the website on http://10.63.192.130:3000
- prepare the _ssh_ environment in github, and add two variables - _SSH_USER_, _SSH_HOST_ and one secret, _KEY_.
- Take a look at workflow file - _.github/workflows/deploy.yml_, You can find example in this document. It already exists in the repo, but modify it if needed.

## Example deploy.yml

The following example, executes the _/home/auto-deploy/deploy_website.sh_, EVERY time someone pushes the changes to the repo.
The environment _ssh_ should be created in github repo settings, and variables _SSH_USER_, _SSH_HOST_ have to be set, as well as secret _KEY_, that github can use to access the VPS - in order to execute deployment script.

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
            "/home/${{ vars.SSH_USER }}/scripts/deploy_website.sh"
```

This file is already part of the repo, the description just acknowledges it's role
