import { createFileRoute } from '@tanstack/react-router';
import { AuthForm } from '@/components/sidequest/auth-form';
import { pageHead } from '@/components/sidequest/placeholder';
export const Route=createFileRoute('/auth')({component:()=> <AuthForm/>,head:()=>pageHead('Sign in to your account','Sign in to SideQuest and return to your saved hackathons.')});