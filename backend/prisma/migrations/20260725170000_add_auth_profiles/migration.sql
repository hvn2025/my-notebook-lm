ALTER TABLE "User"
ADD COLUMN "authUserId" UUID,
ADD COLUMN "username" TEXT;

CREATE UNIQUE INDEX "User_authUserId_key" ON "User"("authUserId");
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
