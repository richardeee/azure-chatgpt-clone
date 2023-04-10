<p align="center">
  <a href="https://discord.gg/NGaa9RPCft">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://user-images.githubusercontent.com/110412045/228325485-9d3e618f-a980-44fe-89e9-d6d39164680e.png">
      <img src="https://user-images.githubusercontent.com/110412045/228325485-9d3e618f-a980-44fe-89e9-d6d39164680e.png" height="128">
    </picture>
    <h1 align="center">ChatGPT Clone on Azure</h1>
  </a>
</p>

> :information_source: **NOTE:**
> This is a demo application that uses Azure OpenAI as backend instead of the original OpenAI API. 
> It is a clone of the original [ChatGPT](https://chat.openai.com/chat) application.
> This application is based on this repo: [chatgpt-clone](https://github.com/danny-avila/chatgpt-clone), see original repo for more information.

 ![clone3](https://user-images.githubusercontent.com/110412045/230538752-9b99dc6e-cd02-483a-bff0-6c6e780fa7ae.gif)

 
### How to run on Azure
> :warning:
> **IMPORTANT NOTE:** **DO NOT USE** Azure App Service Docker Compose feature, it's still in preview and not working. 
> You need to create a new Azure App Service and set the environment variables manually.

[![Deploy to Azure](https://aka.ms/deploytoazurebutton)](https://portal.azure.com/#create/Microsoft.Template/uri/https%3A%2F%2Fraw.githubusercontent.com%2Frichardeee%2Fazure-chatgpt-clone%2Fmain%2Ftemplate%2Ftemplate.json)

1. Create a new Azure Container Service for Mongo:
```bash
az group create --name chatgpt-clone --location southcentralus
az container create --resource-group chatgpt-clone --name mongo --image mongo:latest --dns-name-label chatgpt-clone --ports 27017
```
2. Create a new Azure Container Service for MeiliSearch:
```bash
az container create --resource-group chatgpt-clone --name meilisearch --image getmeili/meilisearch:latest --dns-name-label chatgpt-clone --ports 7700
```
3. Create a Azure App Service for ChatGPT-Clone and set the following environment variables:
```bash
MONGO_URL=mongodb://<mongo-ip>:27017/chatgpt-clone
MEILI_HTTP_ADDR=<meilisearch-ip>:7700
MEILI_HOST=http://<meilisearch-ip>:7700
OPENAI_KEY=<your azure openai key>
OPENAI_BASE=<your azure openai base url>
OPENAI_MODELS=gpt-4,text-davinci-003,gpt-35-turbo,gpt-4-32k
SEARCH=1
MEILI_MASTER_KEY=<your meilisearch master key> #This key will be generated after you create your MEILISEARCH container, look for it in container's startup log
az appservice plan create --name chatgpt-clone-plan --resource-group chatgpt-clone --sku B1 --is-linux
az webapp create --resource-group chatgpt-clone --plan chatgpt-clone-plan --name chatgpt-clone --deployment-container-image-name richardeee/azure-chatgpt-clone:latest
az webapp config appsettings set --resource-group chatgpt-clone --name chatgpt-clone --settings MONGO_URL=$MONGO_URL MEILI_HTTP_ADDR=$MEILI_HTTP_ADDR MEILI_HOST=$MEILI_HOST OPENAI_KEY=$OPENAI_KEY OPENAI_BASE=$OPENAI_BASE OPENAI_MODELS=$OPENAI_MODELS SEARCH=$SEARCH MEILI_MASTER_KEY=$MEILI_MASTER_KEY
```










### Tech Stack


<details open>
<summary><strong>This project uses:</strong></summary>



- [Azure OpenAI](https://learn.microsoft.com/en-us/azure/cognitive-services/openai/overview)
- [Azure Container Instance](https://learn.microsoft.com/en-us/azure/container-instances/)
- [Azure App Service](https://learn.microsoft.com/en-us/azure/app-service/)
- No React boilerplate/toolchain/clone tutorials, created from scratch with react@latest
- Use of Tailwind CSS and [shadcn/ui](https://github.com/shadcn/ui) components
- Docker, useSWR, Redux, Express, MongoDB, [Keyv](https://www.npmjs.com/package/keyv)
</details>



## Getting Started

### Prerequisites
- npm
- Node.js >= 19.0.0
- MongoDB installed or [MongoDB Atlas](https://account.mongodb.com/account/login) (required if not using Docker)
    - MongoDB does not support older ARM CPUs like those found in Raspberry Pis. However, you can make it work by setting MongoDB's version to mongo:4.4.18 in docker-compose.yml, the most recent version compatible with
- [Docker (optional)](https://www.docker.com/get-started/)
- [Azure OpenAI](https://portal.azure.com/#view/Microsoft_Azure_ProjectOxford/CognitiveServicesHub/~/OpenAI)
- BingAI, ChatGPT access tokens (optional, free AIs)

## Usage

- **Clone/download** the repo down where desired
```bash
  git clone https://github.com/richardeee/azure-chatgpt-clone.git
```
- If using MongoDB Atlas, remove `&w=majority` from default connection string.

### Docker

- **Provide** all credentials, (API keys, access tokens, and Mongo Connection String) in [docker-compose.yml](docker-compose.yml) under api service
- **Run** `docker-compose up` to start the app
- Note: MongoDB does not support older ARM CPUs like those found in Raspberry Pis. However, you can make it work by setting MongoDB's version to mongo:4.4.18 in docker-compose.yml, the most recent version compatible with


### User System

This project is enabled with Azure AD authentication.

#### How to enable Azure AD authentication
Step 1: Create an Azure AD application
Follow the steps in [Create an Azure AD application](https://docs.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app) to create an Azure AD application.

Or use Azure CLI to create an Azure AD application:
```bash
az ad app create --display-name "chatgpt-clone" --reply-urls "https://chatgpt-clone.azurewebsites.net/auth/azuread/openid/return" 
```
> :information_source: Note: The reply URL is the URL of your application. For example, if your application is running on localhost:3080, the reply URL is http://localhost:3080/auth/azuread/openid/return.

Step 2: Modify the environment variables in App Service 
- Set `ENABLE_USER_SYSTEM=1`
- Set `AZURE_AD_CLIENT_ID` to the Application (client) ID of your Azure AD application.
- Set `AZURE_AD_CLIENT_SECRET` to the client secret of your Azure AD application.
- Set `AZURE_AD_TENANT_ID` to the tenant ID of your Azure AD application.
- Set `AZURE_AD_CALLBACK_URL` to the reply URL of your Azure AD application.
Or use Azure CLI:
```bash
az webapp config appsettings set --resource-group chatgpt-clone --name chatgpt-clone --settings ENABLE_USER_SYSTEM=1 AZURE_AD_CLIENT_ID=<your azure ad client id> AZURE_AD_CLIENT_SECRET=<your azure ad client secret> AZURE_AD_TENANT_ID=<your azure ad tenant id> AZURE_AD_CALLBACK_URL=<your azure ad callback url>
```


(If you want to implement your user system, open this ↓)

<details>
<summary><strong>Implement your own user system </strong></summary>

To enable the user system, set `ENABLE_USER_SYSTEM=1` in your `.env` file.

The sample structure is simple. It provide three basic endpoint:

1. `/auth/login` will redirect to your own login url. In the sample code, it's `/auth/your_login_page`.
2. `/auth/logout` will redirect to your own logout url. In the sample code, it's `/auth/your_login_page/logout`.
3. `/api/me` will return the userinfo: `{ username, display }`.
   1. `username` will be used in db, used to distinguish between users.
   2. `display` will be displayed in UI.

The only one thing that drive user system work is `req.session.user`. Once it's set, the client will be trusted. Set to `null` if logout.

Please refer to `/api/server/routes/authYourLogin.js` file. It's very clear and simple to tell you how to implement your user system.

Or you can ask chatGPT to write the code for you, here is one example to connect LDAP:

```
Please write me an express module, that serve the login and logout endpoint as a router. The login and logout uri is '/' and '/logout'. Once loginned, save display name and username in session.user, as {display, username}. Then redirect to '/'. Please write the code using express and other lib, and storage any server configuration in a config variable. I want the user to be connected to my LDAP server.
```

</details>

