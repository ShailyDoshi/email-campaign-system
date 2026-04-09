<?php

use App\Http\Controllers\CampaignController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\ContactListController;
use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

// Route::inertia('/', 'welcome', [
//     'canRegister' => Features::enabled(Features::registration()),
// ])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/', [DashboardController::class, 'index'])->name('home');

    Route::prefix('contacts/')->as('contacts.')->group(function () {
        Route::get('index', [ContactController::class, 'index'])->name('index');
        Route::post('store-or-update/{contact?}', [ContactController::class, 'storeOrUpdate'])->name('store_or_update');
        Route::get('delete/{contact}', [ContactController::class, 'delete'])->name('delete');
    });

    Route::prefix('contact-lists/')->as('contact_lists.')->group(function () {
        Route::get('index', [ContactListController::class, 'index'])->name('index');
        Route::post('store-or-update/{list?}', [ContactListController::class, 'storeOrUpdate'])->name('store_or_update');
        Route::get('show/{list}', [ContactListController::class, 'show'])->name('show');
        Route::get('delete/{list}', [ContactListController::class, 'delete'])->name('delete');
        Route::post('{list}/assign-contacts', [ContactListController::class, 'assignContacts'])->name('assign_contacts');
        Route::get('{list}/remove-contact/{contact}', [ContactListController::class, 'removeContact'])->name('remove_contact');
    });

    Route::prefix('campaigns/')->as('campaigns.')->group(function () {
        Route::get('index', [CampaignController::class, 'index'])->name('index');
        Route::post('store-or-update/{campaign?}', [CampaignController::class, 'storeOrUpdate'])->name('store_or_update');
        Route::get('show/{campaign}', [CampaignController::class, 'show'])->name('show');
        Route::post('{campaign}/send', [CampaignController::class, 'send'])->name('send');
        Route::post('{campaign}/retry', [CampaignController::class, 'retry'])->name('retry');
        Route::get('delete/{campaign}', [CampaignController::class, 'delete'])->name('delete');
    });
});

require __DIR__.'/settings.php';
