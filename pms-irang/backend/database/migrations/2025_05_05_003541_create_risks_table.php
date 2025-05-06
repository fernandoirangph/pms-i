<?php
// Database/migrations/xxxx_xx_xx_create_risks_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateRisksTable extends Migration
{
    public function up()
    {
        Schema::create('risks', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description');
            $table->enum('impact', ['low', 'medium', 'high', 'critical'])->default('medium');
            $table->enum('probability', ['low', 'medium', 'high', 'certain'])->default('medium');
            $table->text('mitigation_strategy')->nullable();
            $table->enum('status', ['identified', 'mitigated', 'occurred', 'closed'])->default('identified');
            $table->foreignId('project_id')->constrained()->onDelete('cascade');
            $table->foreignId('reported_by')->constrained('users');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('risks');
    }
}
