import { React } from "react";
import Layout from "../../../components/layout";
import {
  getMentorRequests,
  getUserById,
  isUserAdmin,
} from "../../../util/databaseAccess";
import { MentorDetails } from "../../../components/AdminComponent";
import { getToken } from "next-auth/jwt";

export default function MentorById({ mentor, requests }) {
  return (
    <Layout>
      <MentorDetails mentor={mentor} requests={requests} />
    </Layout>
  );
}

export async function getServerSideProps({ params, req }) {
  const fetchMentor = getUserById(params.id);
  const token = await getToken({ req });

  if (!token) {
    return {
      redirect: {
        destination: "/api/auth/signin",
        permanent: false,
      },
    };
  }

  const user = await isUserAdmin(token.sub);
  const mentor = await fetchMentor;

  if (!user || !mentor)
    return {
      redirect: {
        destination: "/",
      },
    };

  const requests = await getMentorRequests(mentor._id);

  return {
    props: { mentor, requests },
  };
}