# Usa la imagen oficial de Nginx basada en Alpine (ligera)
FROM nginx:alpine

# Copia los archivos estáticos a la carpeta de publicación de Nginx
COPY ./ /usr/share/nginx/html

# Sobrescribe la configuración por defecto de Nginx con nuestra configuración de proxy
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Redirigir el puerto en caso de ser necesario
EXPOSE 80
