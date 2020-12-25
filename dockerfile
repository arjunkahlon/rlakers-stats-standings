FROM alpine:3.7
COPY . .
RUN npm i
CMD [npm run]