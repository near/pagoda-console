-- CreateEnum
CREATE TYPE "UserActionType" AS ENUM ('ROTATE_API_KEY');

-- CreateTable
CREATE TABLE "UserAction" (
    "id" SERIAL NOT NULL,
    "action" "UserActionType" NOT NULL,
    "data" JSONB,
    "userId" INTEGER NOT NULL,
    "actionTimestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserAction_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserAction" ADD CONSTRAINT "UserAction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
