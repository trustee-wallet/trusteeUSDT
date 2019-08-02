#FROM amazonlinux
FROM centos
#MAINTAINER RomanH

#prepare system
RUN yum -y update && yum clean all
RUN yum install -y yum-utils && yum clean all
RUN yum-builddep -y python
RUN yum install -y make && yum clean all

#create folders for apps
RUN mkdir /usr/microtrustee

#we need node js
RUN yum install -y git && yum clean all
RUN curl -sL https://rpm.nodesource.com/setup_8.x | bash -
RUN yum install -y nodejs && yum clean all
RUN echo 'export NODE_PATH="'$(npm root -g)'"' >> /etc/profile.d/npm.sh
RUN npm install --unsafe-perm --global fs
RUN npm install --unsafe-perm --global cron
RUN npm install --unsafe-perm --global sleep
RUN npm install --unsafe-perm --global pg
RUN npm install --unsafe-perm --global Turtus/node-pg-format
RUN npm install --unsafe-perm --global node-cmd
RUN npm install --unsafe-perm --global pm2
RUN npm install --unsafe-perm --global request
RUN npm install --unsafe-perm --global mocha
RUN npm install --unsafe-perm --global express
RUN npm install --unsafe-perm --global axios

ADD microtrustee /usr/microtrustee

WORKDIR /usr/microtrustee

CMD printenv | grep -v "yyyyyxxxx" >> /etc/environment && node /usr/microtrustee/micro_cron/cron.js
