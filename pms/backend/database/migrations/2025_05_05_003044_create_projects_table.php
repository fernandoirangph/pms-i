// Database/migrations/xxxx_xx_xx_create_projects_table.php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateProjectsTable extends Migration
{
    public function up()
    {
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->date('start_date');
            $table->date('end_date');
            $table->decimal('budget', 10, 2)->default(0);
            $table->decimal('actual_cost', 10, 2)->default(0);
            $table->enum('status', ['not_started', 'in_progress', 'on_hold', 'completed', 'cancelled'])
                ->default('not_started');
            $table->foreignId('manager_id')->constrained('users');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('projects');
    }
}
