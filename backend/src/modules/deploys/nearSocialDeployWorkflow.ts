export const ymlText = `
name: Build and Deploy
on:
  push:
    branches:
      - main
  workflow_dispatch:
  
env:
  PAGODA_CONSOLE_URL: https://7268-85-203-21-201.ap.ngrok.io
  
jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Set env
        run: |
          TEMP_SECRET="\${{secrets.PAGODA_CONSOLE_TOKEN}}"
          TEMP=$(echo \${TEMP_SECRET:6} | base64 --decode)
          echo "GITHUB_REPO_FULL_NAME=$(echo \${TEMP%:*})" >> $GITHUB_ENV
    
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "18.x"

      - name: Add repo deployment
        id: add-repo-deployment
        uses: fjogeleit/http-request-action@v1
        with:
          url: '\${{ env.PAGODA_CONSOLE_URL }}/deploys/addRepoDeployment'
          method: 'POST'
          customHeaders: '{"Authorization": "\${{ secrets.PAGODA_CONSOLE_TOKEN }}"}'
          data: '{"githubRepoFullName":"\${{ env.GITHUB_REPO_FULL_NAME }}","commitMessage": "\${{ github.event.head_commit.message }}", "commitHash": "\${{ github.sha }}"}'

      - name: Upload Near Social Component 
        id: uploadNearSocialComponent
        uses: jon-lewis/upload-file-action@master
        with:
          url: '\${{ env.PAGODA_CONSOLE_URL }}/deploys/addNearSocialComponentDeployment'
          forms: '{"repoDeploymentSlug": "\${{ fromJson(steps.add-repo-deployment.outputs.response).repoDeploymentSlug }}", "componentName":"NearSocialComponent"}'
          customHeaders: '{"Authorization": "\${{ secrets.PAGODA_CONSOLE_TOKEN }}"}'
          fileForms: '{"index.jsx":"index.jsx"}'
`;
