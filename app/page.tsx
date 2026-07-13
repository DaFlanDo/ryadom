import { redirect } from "next/navigation";

// Главная ведёт в конструктор: новый пользователь сразу попадает в онбординг
// (а если уже вошёл и собрал профиль — в редактор). Демо-витрины больше нет.
export default function Home() {
  redirect("/edit");
}
