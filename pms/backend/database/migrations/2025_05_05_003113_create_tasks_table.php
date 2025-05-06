// Database/migrations/xxxx_xx_xx_create_tasks_table.php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTasksTable extends Migration
{
    public function up()
    {
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->date('start_date');
            $table->date('end_date');
            $table->enum('status', ['not_started', 'in_progress', 'review', 'completed'])
                ->default('not_started');
            $table->enum('priority', ['low', 'medium', 'high', 'urgent'])
                ->default('medium');
            $table->decimal('estimated_hours', 8, 2)->default(0);
            $table->decimal('actual_hours', 8, 2)->default(0);
            $table->foreignId('project_id')->constrained()->onDelete('cascade');
            $table->json('team_member_ids')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('tasks');
    }
}
