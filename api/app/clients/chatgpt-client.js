require('dotenv').config();
const { KeyvFile } = require('keyv-file');

const AzureChatGPTClient = require('./azure-chatgpt-api');

const askClient = async ({
  text,
  parentMessageId,
  conversationId,
  model,
  chatGptLabel,
  promptPrefix,
  temperature,
  top_p,
  presence_penalty,
  frequency_penalty,
  onProgress,
  abortController
}) => {
  const ChatGPTClient = AzureChatGPTClient;
  const store = {
    store: new KeyvFile({ filename: './data/cache.json' })
  };

  const clientOptions = {
    // Warning: This will expose your access token to a third party. Consider the risks before using this.
    reverseProxyUrl: process.env.OPENAI_REVERSE_PROXY || null,

    modelOptions: {
      model: model,
      temperature,
      top_p,
      presence_penalty,
      frequency_penalty,
    },

    chatGptLabel,
    promptPrefix,
    proxy: process.env.PROXY || null,
    debug: false
  };

  const client = new ChatGPTClient(process.env.OPENAI_KEY, process.env.OPENAI_BASE, clientOptions, store);
  let options = { onProgress, abortController };

  if (!!parentMessageId && !!conversationId) {
    options = { ...options, parentMessageId, conversationId };
  }

  const res = await client.sendMessage(text, options);
  return res;
};

module.exports = { askClient };
