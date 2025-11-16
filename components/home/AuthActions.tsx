"use client";

import { useState, useTransition, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AuthActionsProps = {
  isAdmin: boolean;
};

export function AuthActions({ isAdmin }: AuthActionsProps) {
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    startTransition(async () => {
      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ password }),
        });

        if (!response.ok) {
          const message = await response.text();
          toast.error(message || "Invalid credentials");
          return;
        }

        toast.success("Logged in successfully");
        setPassword("");
        setIsLoginDialogOpen(false);
        router.refresh();
      } catch (error) {
        console.error("Error logging in", error);
        toast.error("Something went wrong, please try again.");
      }
    });
  };

  const handleLogout = () => {
    startTransition(async () => {
      try {
        const response = await fetch("/api/auth/logout", {
          method: "POST",
        });

        if (!response.ok) {
          toast.error("Failed to log out");
          return;
        }

        toast.success("Logged out");
        router.refresh();
      } catch (error) {
        console.error("Error logging out", error);
        toast.error("Failed to log out, please try again.");
      }
    });
  };

  if (!isAdmin) {
    return (
      <>
        <Button
          size="sm"
          className="cursor-pointer rounded-full px-4"
          onClick={() => setIsLoginDialogOpen(true)}
        >
          Log in
        </Button>

        <Dialog open={isLoginDialogOpen} onOpenChange={setIsLoginDialogOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Admin login</DialogTitle>
              <DialogDescription>
                Enter the admin password to enable editing and manage memory lanes.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter admin password"
                  disabled={isPending}
                />
              </div>
              <DialogFooter className="gap-2 sm:gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="cursor-pointer rounded-full px-4"
                  onClick={() => setIsLoginDialogOpen(false)}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="cursor-pointer rounded-full px-4"
                  disabled={isPending || !password}
                >
                  {isPending ? "Logging in..." : "Log in"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="cursor-pointer rounded-full px-4"
        onClick={handleLogout}
        disabled={isPending}
      >
        Log out
      </Button>
    </>
  );
}