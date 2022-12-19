ARG ARG_NODE_VERSION
FROM node:$ARG_NODE_VERSION AS dev

ARG ARG_OMZSHD_VERSION
ENV \
    # term:
    TERM=xterm

# update and install dependency
RUN set -ex \
    # && apk add --no-cache --virtual .build-deps \
    && apk add --no-cache --virtual .run-deps \
        # tini (https://github.com/krallin/tini)
        tini \
        # Other tools
        git \
        curl \
        bash \
    && apk upgrade \
    # See https://github.com/deluan/zsh-in-docker
    # Uses "Spaceship" theme with some customization. Uses some bundled plugins and installs some more from github
    && sh -c "$(curl -fsSL https://github.com/deluan/zsh-in-docker/releases/download/v${ARG_OMZSHD_VERSION}/zsh-in-docker.sh)" -- \
        -p git \
        -p https://github.com/zsh-users/zsh-autosuggestions \
        -p https://github.com/zsh-users/zsh-completions \
        -p https://github.com/zsh-users/zsh-history-substring-search \
        -p https://github.com/zsh-users/zsh-syntax-highlighting \
        -p 'history-substring-search' \
        -a 'bindkey "\$terminfo[kcuu1]" history-substring-search-up' \
        -a 'bindkey "\$terminfo[kcud1]" history-substring-search-down' \
    # cleaning up unused files
    # && apk del .build-deps \
    && rm -rf /var/lib/apt/lists/* \
    && rm -rf /var/cache/apk/* \
    && rm -rf /root/.cache

SHELL ["/bin/zsh", "-c"]

WORKDIR /workspace
