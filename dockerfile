FROM node:14-alpine
RUN mkdir /code
WORKDIR /code
ADD . /code/
ENV NODE_ENV=production
RUN npm i
RUN touch /var/log/cron.log
COPY config/crontab /etc/cron.d/rlakercron
RUN chmod 0644 /etc/cron.d/rlakercron
CMD cron -f