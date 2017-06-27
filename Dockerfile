FROM python:2.7

RUN mkdir /code
WORKDIR /code


COPY ./requirements.txt /tmp/
COPY ./requirements-vendor.txt /tmp/

RUN pip install --requirement /tmp/requirements-vendor.txt -t lib/
RUN pip install --requirement /tmp/requirements.txt -t lib/

ADD . /code

EXPOSE 8080
