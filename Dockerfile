FROM node

WORKDIR /app

COPY package.json /app


# Работает при создании образа
RUN npm install

COPY . .


EXPOSE 3000


# Работает при запуске образа
CMD ["node", "app.js"]