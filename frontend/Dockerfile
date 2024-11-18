
FROM node:16-slim


WORKDIR /app


COPY package.json package-lock.json /app/


RUN npm install


COPY . /app/


RUN npm run build


RUN npm install -g serve


EXPOSE 3000


CMD ["serve", "-s", "build", "-l", "3000"]
