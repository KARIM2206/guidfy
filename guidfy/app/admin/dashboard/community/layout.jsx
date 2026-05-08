import { CommunityProvider } from "@/app/CONTEXT/CommuntiyProvider";

export default function CommunityLayout({ children }) {
    return (
        <CommunityProvider>
        {children}
        </CommunityProvider>
    );
}