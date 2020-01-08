FROM node

WORKDIR /app

RUN npm install -g @angular/cli

RUN git clone https://github.com/lealbrunocalhau/angular7-financeiro.git .

RUN npm install

WORKDIR /app

CMD ["ng", "serve", "--port", "4210", "--host", "0.0.0.0"]


