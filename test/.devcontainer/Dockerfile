FROM mcr.microsoft.com/playwright:v1.28.0-focal

# Remove node 16 from the playwright image and replace with node 14 which is what this project uses.
RUN apt remove -y nodejs && \
    curl -sL https://deb.nodesource.com/setup_16.x | bash - && \
    apt-get install -y nodejs