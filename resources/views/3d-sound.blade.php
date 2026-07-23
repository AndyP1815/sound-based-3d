@extends('layouts.fullscreen')

@section('content')
    <div id="scene-container" class="fixed inset-0 overflow-hidden bg-black"></div>

    @vite('resources/js/pages/3d-sound.js')
@endsection
