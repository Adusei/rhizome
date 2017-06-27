FROM python:2.7



COPY ./requirements.txt /tmp/

RUN pip install --requirement /tmp/requirements-vendor.txt -t lib/
RUN pip install --requirement /tmp/requirements.txt -t lib/

WORKDIR '/mysite'

EXPOSE 8080
