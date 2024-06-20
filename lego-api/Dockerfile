FROM php:7.4-apache

# Install necessary PHP extensions
RUN docker-php-ext-install mysqli pdo pdo_mysql

# Copy PHP source code to the container
COPY . /var/www/html/

EXPOSE 80

CMD ["apache2-foreground"]
