FROM ubuntu:rolling

#RUN cp -a /mnt/{.git,build,Makefile} . && find . -type f -print0 | xargs -0 dos2unix -- && source /root/emsdk/emsdk_env.sh && make && cp ffmpeg*.js /mn
# cp -a /mnt/{.git,build,Makefile} . && find . -type f -print0 | xargs -0 dos2unix -ic0 | xargs -0 dos2unix -b && source /root/emsdk/emsdk_env.sh && make && cp ffmpeg*.js /mnt

RUN apt update
RUN DEBIAN_FRONTEND="noninteractive" apt install -y tzdata
RUN apt install -y git python3 build-essential automake libtool pkg-config dos2unix && apt clean \
 && cd /root && git clone https://github.com/emscripten-core/emsdk.git \
 && cd /root/emsdk && ./emsdk install latest && ./emsdk activate latest
RUN echo "cp -a /mnt/{.git,build,Makefile} . && find . -type f -print0 | xargs -0 dos2unix -ic0 | xargs -0 dos2unix -b && source /root/emsdk/emsdk_env.sh && make && rm -rf /mnt/dist && mkdir /mnt/dist && cp ffmpeg*.js /mnt/dist/" > /opt/build.sh
RUN chmod +x /opt/build.sh
