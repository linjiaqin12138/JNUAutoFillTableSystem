FROM nikolaik/python-nodejs:python3.7-nodejs12-alpine
WORKDIR /app
COPY ./scripts/requirements.txt .
RUN echo  "[global]\n\
trusted-host=mirrors.aliyun.com\n\
index-url=http://mirrors.aliyun.com/pypi/simple" > /etc/pip.conf && \
ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && \
    echo "Asia/Shanghai" > /etc/timezone
RUN echo "# min   hour    day     month   weekday command \n\
*      *      *      *       *       /usr/local/bin/python /app/scripts/script.py >> /var/log/jnuHealthCheck/script.log \n" > /var/spool/cron/crontabs/root
RUN pip install -r requirements.txt