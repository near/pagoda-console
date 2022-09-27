#!/bin/bash

if [ -z $1 ] 
then
    echo "usage: npm run gen:module <module name>";
    exit 1;
fi;

MODULE_NAME=`node -p "\"$1\".toLowerCase()"`
MODULE_NAME_UPPER=`node -p "\"$MODULE_NAME\".toUpperCase()"`
MODULE_PATH="src/modules/$MODULE_NAME"

if [ -d "$MODULE_PATH" ] 
then
    echo "module already exists";
    exit 1;
fi;

echo "Generating module: $MODULE_NAME"

# Generate the new NestJS module in the modules module
cd ./src/modules;
# Create the NestJS module
npx nest g module "$MODULE_NAME" 

cd ../..;

# Copy the template files over
cp -r ./modules/template/* "$MODULE_PATH"

echo "npx prisma \"\$@\" --schema=\"./src/modules/${MODULE_NAME}/prisma/schema.prisma\"" >> ./scripts/prisma.sh

cd "$MODULE_PATH";

# Generate an empty controller and service
npx nest g --flat service "$MODULE_NAME"
npx nest g --flat controller "$MODULE_NAME"

# Declare which files need interpolation
TEMPLATE_FILES="prisma.service.ts
./prisma/schema.prisma
./prisma/.env
"
for FILE in $TEMPLATE_FILES
do
	sed -i "s/{{MODULE_NAME}}/$MODULE_NAME/g" "$FILE"
    sed -i "s/{{MODULE_NAME_UPPER_CASE}}/$MODULE_NAME_UPPER/g" "$FILE"
done

# Finally, generate an empty database
npx prisma migrate dev --skip-generate

echo "Successfully generated module: $MODULE_NAME"