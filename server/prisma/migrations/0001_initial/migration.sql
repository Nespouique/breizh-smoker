-- CreateTable
CREATE TABLE "smokes" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "smokes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "items" (
    "id" SERIAL NOT NULL,
    "smoke_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "icon" TEXT,
    "cut" TEXT,
    "initial_weight" DOUBLE PRECISION,
    "diameter" DOUBLE PRECISION,
    "target_weight" DOUBLE PRECISION,
    "curing_method" TEXT,
    "status" TEXT NOT NULL DEFAULT 'prep',
    "salt_amount" DOUBLE PRECISION,
    "sugar_amount" DOUBLE PRECISION,
    "pepper_amount" DOUBLE PRECISION,
    "spices" TEXT,
    "curing_start_date" TIMESTAMP(3),
    "curing_end_date" TIMESTAMP(3),
    "rinsing_date" TIMESTAMP(3),
    "drying_start_date" TIMESTAMP(3),
    "smoking_date" TIMESTAMP(3),
    "aging_start_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weight_logs" (
    "id" SERIAL NOT NULL,
    "item_id" INTEGER NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "weight_logs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_smoke_id_fkey" FOREIGN KEY ("smoke_id") REFERENCES "smokes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weight_logs" ADD CONSTRAINT "weight_logs_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
